<?php
    namespace App\Strategies;

    use App\Strategies\LlmStrategyInterface;
    use App\Utilities\Context;
    use App\Utilities\LlmResponseProcessor;

    class LlmRewrite implements LlmStrategyInterface {

        public function __construct(private readonly LlmResponseProcessor $processor) {}

        public function process(Context $context): string {
            
            $text = $context->getText();
            $style = $context->getOptions()['style'];
            $prompt = '';
            $response = $this->processor->make($prompt, $text);
            $this->processor->handleError($response);

            return $response['choices'][0]['message']['content'] ?? 'Risposta vuota';
        }

    }
    
?>