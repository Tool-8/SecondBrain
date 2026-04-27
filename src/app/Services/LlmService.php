<?php
    namespace App\Services;

    use App\Factories\LlmStrategyFactory;
    use App\Utilities\Context;

    class LlmService {

        public function __construct(private readonly LlmStrategyFactory $factory) { }

        public function process (string $content, string $action, ?array $options = null) : string {
            $strategy = $this->factory->make($action);
            $context = new Context($content, $options);

            $result = $strategy->process($context);

            return $result;
        }
    }
?>