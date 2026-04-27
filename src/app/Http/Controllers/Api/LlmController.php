<?php
    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Services\LlmService;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Validation\Rule;
    use RuntimeException;
    use InvalidArgumentException;

    class LlmController extends Controller {
        public function __construct(private readonly LlmService $service) { }

        public function __invoke(Request $request) : JsonResponse {
            $validated = $request->validate([
                'content' => 'required|string',
                'action'  => 'required|string|in:summarize,translate,rewrite,blackhat,bluehat,greenhat,redhat,whitehat,yellowhat,distant writing',
                'options' => 'array',
                'options.style'   => [
                Rule::requiredIf($request->action === 'rewrite'),
                    'array',
                    'min:1',
                ],
                'options.style.*' => [
                    Rule::when($request->action === 'rewrite', [
                        'string',
                        'in:grammar,extension,lexicon,stylistic',
                    ]),
                ],
                'options.lang' => [
                    Rule::requiredIf($request->action === 'translate'),
                    Rule::when($request->action === 'translate', [
                        'string',
                        'in:it,en,fr,de,es,pt',
                    ]),
                ],
            ]);

            try {
                $result = $this->service->process($validated['content'], $validated['action'], $validated['options'] ?? []);
                return response()->json(['result' => $result], 200);
            } catch (RuntimeException $e) {
                return response()->json(['error' => $e->getMessage()], 502);
            } catch (InvalidArgumentException $e) {
                return response()->json(['error' => $e->getMessage()], 400);
            }
        }
    }
?>
