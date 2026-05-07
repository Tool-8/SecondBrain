<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmBlueHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
        
        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Critica il testo a livello di struttura e organizzazione complessiva, valutando coerenza, ordine e completezza dell’analisi. Indica anche come migliorare il processo di revisione del testo. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>