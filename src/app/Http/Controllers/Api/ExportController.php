<?php
    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Services\ExportService;
    use Illuminate\Http\Request;
    use Illuminate\Http\JsonResponse;
    use RuntimeException;
    use InvalidArgumentException;
    use Illuminate\Validation\Rule;

    class ExportController extends Controller {

        public function __construct(private readonly ExportService $service) {}

        public function __invoke(Request $request): JsonResponse {

                $data = $request->validate(
                    [
                        'id'      => ['required', 'string'],
                        'format' => [
                            'required', 
                            'string', 
                            //Rule::in('md', 'html', 'pdf')
                            ],
                    ]
                );

            try {
                return response()->json(($this->service->export($data['id'], $data['format'])));
            
            } catch (RuntimeException $e) {
                return $this->mapError($e);

            } catch (InvalidArgumentException $e) {
                return response()->json(['message' => $e->getMessage()], 400);
            }
        }

        private function mapError(RuntimeException $e): JsonResponse {
            return match ($e->getMessage()) {
                'INVALID_ID'    => response()->json(['message' => 'Invalid note id'], 400),
                'NOT_FOUND'     => response()->json(['message' => 'Note not found'], 404),
                default         => response()->json(['message' => 'Server error'], 500),
            };
        }

    }


?>