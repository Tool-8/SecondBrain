<?php
    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Services\ExportService;
    use Illuminate\Http\Request;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Response;
    use RuntimeException;
    use InvalidArgumentException;

    class ExportController extends Controller {

        public function __construct(private readonly ExportService $service) {}

        public function __invoke(Request $request, string $id): JsonResponse|Response {

                $data = $request->validate(
                    [
                        'format' => [
                            'required', 
                            'string', 
                            //Rule::in('md', 'html', 'pdf')
                            ],
                    ]
                );

            try {
                $export = $this->service->export($id, $data['format']);
            
                return response($export['content'])
                ->header('Content-Type', $export['content_type'])
                ->header('Content-Disposition', 'attachment; filename="' . $export['filename'] . '"');

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