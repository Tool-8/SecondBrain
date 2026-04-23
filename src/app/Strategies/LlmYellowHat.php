<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmYellowHat implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
        
        public function process(Context $context): string {

            $text = $context->getText();
            $prompt = 'Evidenzia i punti di forza del testo, la sua efficacia comunicativa e il valore informativo o argomentativo. Spiega anche in che modo queste caratteristiche rendono il contenuto convincente o utile per il lettore.Evidenzia i punti di forza del testo, la sua efficacia comunicativa e il valore informativo o argomentativo. Spiega anche in che modo queste caratteristiche rendono il contenuto convincente o utile per il lettore. Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>