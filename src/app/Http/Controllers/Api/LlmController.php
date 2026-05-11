<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LlmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class LlmController extends Controller {
    public function __construct(private readonly LlmService $service) {}

    public function summarize(Request $request): JsonResponse {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        try {
            $result = $this->service->process($validated['content'], 'summarize', []);
            return response()->json(['result' => $result], 200);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }

    public function translate(Request $request): JsonResponse {
        $validated = $request->validate([
            'content' => 'required|string',
            'lang'    => 'required|string|in:it,en,fr,de,es,pt',
        ], [
            'lang.in' => 'Translation in :input is not supported.'
        ]);

        try {
            $result = $this->service->process($validated['content'], 'translate', ['lang' => $validated['lang']]);
            return response()->json(['result' => $result], 200);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }

    public function rewrite(Request $request): JsonResponse {
        $validated = $request->validate([
            'content' => 'required|string',
            'style'   => 'required|array|min:1',
            'style.*' => 'string|in:grammar,extension,lexicon,stylistic',
        ]);

        try {
            $result = $this->service->process($validated['content'], 'rewrite', ['style' => $validated['style']]);
            return response()->json(['result' => $result], 200);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }

    public function hat(Request $request, string $type): JsonResponse {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $hats = ['blackhat','bluehat','greenhat','redhat','whitehat','yellowhat'];

        if (!in_array($type, $hats)) {
            return response()->json(['message' => "Hat '$type' not supported."], 400);
        }

        try {
            $result = $this->service->process($validated['content'], $type, []);
            return response()->json(['result' => $result], 200);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }

    public function distantWriting(Request $request): JsonResponse {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        try {
            $result = $this->service->process($validated['content'], 'distant writing', []);
            return response()->json(['result' => $result], 200);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }
}