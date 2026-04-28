<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmWhiteHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
        
        public function process(Context $context): string {
            
            $text = $context->getText();
            $prompt = 'Critica il testo in modo oggettivo, concentrandoti solo su fatti, informazioni esplicite e contenuto verificabile. Evidenzia ambiguità, assunzioni implicite e informazioni mancanti senza introdurre opinioni. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>