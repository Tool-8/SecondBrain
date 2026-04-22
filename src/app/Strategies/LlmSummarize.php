<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use Illuminate\Support\Facades\Http;

    class LlmSummarize implements LlmStrategyInterface {
     
        public function process(Context $context): string {
            $text = $context->getText();

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
                            'content' => 'Riassumi il seguente testo in modo chiaro e conciso mantenendo solo le informazioni più importanti. Non aggiungere introduzioni, commenti o frasi come “Ecco il riassunto”. Restituisci esclusivamente il riassunto.'
                            ],
                        [
                            'role' => 'user', 
                            'content' => $text
                            ],
                        ],
                    'temperature' => 0.2,
                    'max_tokens' => 300,
                    ]);

            if (!$response->ok()) {
                return 'Errore LLM: ' . $response->body();
            }

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>