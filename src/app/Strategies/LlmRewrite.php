<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmRewrite implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}

        public function process(Context $context): string {
            
            $text = $context->getText();
            $styles = $context->getOptions()['style'];

            $prompts = [
                'grammar'   => 'Correggi gli errori grammaticali, ortografici e sintattici del testo, mantenendo il significato originale.',
                'extension' => 'Estendi il testo aggiungendo dettagli, esempi e approfondimenti, mantenendo il tema originale.',
                'lexicon'   => 'Migliora il lessico del testo sostituendo le parole con termini più precisi, ricchi e appropriati al contesto.',
                'stylistic' => 'Varia lo stile del testo rendendolo più fluido, elegante e coinvolgente, senza alterarne il contenuto.',
            ];

            $prompt  = "Riscrivi il testo applicando le seguenti istruzioni:\n";
            $prompt .= implode("\n", array_map(fn($s) => '- ' . $prompts[$s], $styles));
            $prompt .= 'Non aggiungere introduzioni, commenti o frasi come “Ecco il risultato”. Restituisci esclusivamente il testo generato.';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>