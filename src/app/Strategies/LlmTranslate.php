<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmTranslate implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
        
        public function process(Context $context): string {
            
            $text = $context->getText();
            $lang = $context->getOptions()['lang'];
            $prompt = '';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>