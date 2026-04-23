<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmGreenHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {} 
        
        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Critica il testo proponendo miglioramenti, alternative e possibili riscritture che ne aumentino chiarezza, efficacia o originalità. Suggerisci modifiche concrete e creative. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato. ';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>