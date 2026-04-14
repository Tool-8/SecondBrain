<?php
    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Services\NoteService;
    use Illuminate\Http\Request;
    use Illuminate\Http\JsonResponse;
    use RuntimeException;

    class NoteController extends Controller
    {
        public function __construct(
            private readonly NoteService $noteService,
        ) {}


        public function index(): JsonResponse
        {
            return response()->json($this->noteService->list());
        }

        public function show(string $id): JsonResponse
        {
            try {
                return response()->json($this->noteService->get($id));
            } catch (RuntimeException $e) {
                return $this->mapError($e);
            }
        }

        public function store(Request $request): JsonResponse
        {
            $data = $request->validate([
                'title'      => ['required', 'string', 'max:200'],
                'content_md' => ['nullable', 'string'],
            ]);

            try {
                return response()->json(
                    $this->noteService->create($data['title'], $data['content_md'] ?? ''),
                    201
                );
            } catch (RuntimeException $e) {
                return $this->mapError($e);
            }
        }

        public function update(Request $request, string $id): JsonResponse
        {
            $data = $request->validate([
                'title'      => ['required', 'string', 'max:200'],
                'content_md' => ['nullable', 'string'],
            ]);

            try {
                return response()->json(
                    $this->noteService->update($id, $data['title'], $data['content_md'] ?? '')
                );
            } catch (RuntimeException $e) {
                return $this->mapError($e);
            }
        }

        public function destroy(string $id): JsonResponse
        {
            try {
                $this->noteService->delete($id);
                return response()->json(null, 204);
            } catch (RuntimeException $e) {
                return $this->mapError($e);
            }
        }

        private function mapError(RuntimeException $e): JsonResponse
        {
            return match ($e->getMessage()) {
                'NOT_FOUND'     => response()->json(['message' => 'Note not found'], 404),
                'INVALID_ID'    => response()->json(['message' => 'Invalid note id'], 400),
                'TITLE_IN_USE'  => response()->json(['message' => 'Titolo già utilizzato'], 409),
                'DELETE_FAILED' => response()->json(['message' => 'Eliminazione fallita'], 500),
                default         => response()->json(['message' => 'Server error'], 500),
            };
        }
    }
?>