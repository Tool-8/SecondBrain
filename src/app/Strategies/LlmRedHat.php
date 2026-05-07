<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmRedHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {} 
        
        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Critica il testo dal punto di vista delle reazioni emotive che può generare nel lettore, indicando eventuali problemi di tono o impatto emotivo. Evidenzia se il contenuto risulta incoerente, forzato o poco naturale a livello percettivo. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>