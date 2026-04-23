<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmSummarize implements LlmStrategyInterface {
     
        public function __construct(private readonly LlmResponseProcessor $processor) {}

        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Riassumi il seguente testo in modo chiaro e conciso mantenendo solo le informazioni più importanti. Non aggiungere introduzioni, commenti o frasi come “Ecco il riassunto”. Restituisci esclusivamente il riassunto.';
        
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response->json('choices.0.message.content') ?? 'Risposta vuota';
        }

    }
    
?>