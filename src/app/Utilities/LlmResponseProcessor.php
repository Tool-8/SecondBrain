<?php

    namespace App\Utilities;

    use Illuminate\Support\Facades\Http;
    use Illuminate\Http\Client\Response;
    use RuntimeException;

    class LlmResponseProcessor {

        public function make(string $prompt, string $text): Response {
            $response = Http::withHeaders(
                    [
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . config('services.llm.api_key'),
                    ])->post(config('services.llm.base_url') . '/v1/chat/completions', 

                    [
                        'model' => config('services.llm.model'),
                        'messages' => [
                            [
                                'role' => 'system', 
                                'content' => $prompt
                                ],
                            [
                                'role' => 'user', 
                                'content' => $text
                                ],
                            ],
                        'temperature' => 0.2,
                        'max_tokens' => 300,
                    ]);

            return $response;
        }
        public function handleError(Response $response): void {
            if (!$response->ok()) {
                $error = $response->json('error.message') ?? $response->body();
                throw new RuntimeException('Errore LLM ' . $response->status() . ': ' . $error);
            }
        }
    }