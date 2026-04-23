<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmBlackHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
     
        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Individua in modo critico debolezze logiche, incoerenze, rischi argomentativi e possibili fraintendimenti del testo. Evidenzia anche punti vulnerabili che potrebbero indebolire la credibilità complessiva del contenuto. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>