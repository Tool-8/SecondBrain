<?php
    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Services\ImportService;
    use Illuminate\Http\Request;
    use Illuminate\Http\JsonResponse;
    use RuntimeException;
    use InvalidArgumentException;

    class ImportController extends Controller {

        public function __construct(private readonly ImportService $service) {}

        public function __invoke(Request $request): JsonResponse {

            $request->validate(
                [
                'file' => [
                    'file',           
                    'required', 
                    'max:10240'
                    ],
                ]
            );
                
            $file = $request->file('file');

            try {
                $note = $this->service->handleUpload($file);
                return response()->json($note, 201);

            } catch (RuntimeException $e) {
                return $this->mapError($e);

            } catch (InvalidArgumentException $e) {
                return response()->json(['message' => $e->getMessage()], 400);
            }
            
        }

        private function mapError(RuntimeException $e): JsonResponse {
            return match ($e->getMessage()) {
                'TITLE_IN_USE'    => response()->json(['message' => 'Title already used by another note'], 400),
                default         => response()->json(['message' => 'Server error'], 500),
            };
        }

    }


?>