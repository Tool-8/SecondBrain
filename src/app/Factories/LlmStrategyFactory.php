<?php
    namespace App\Factories;

    use App\Strategies\LlmStrategyInterface;

    use App\Strategies\LlmBlackHat;
    use App\Strategies\LlmBlueHat;
    use App\Strategies\LlmGreenHat;
    use App\Strategies\LlmRedHat;
    use App\Strategies\LlmWhiteHat;
    use App\Strategies\LlmYellowHat;

    use App\Strategies\LlmDistantWriting;
    use App\Strategies\LlmRewrite;
    use App\Strategies\LlmSummarize;
    use App\Strategies\LlmTranslate;
    use App\Utilities\LlmResponseProcessor;
    use InvalidArgumentException;

    class LlmStrategyFactory {

        public function __construct(private readonly LlmResponseProcessor $processor) {}
        public function make(string $action): LlmStrategyInterface {
            return match($action) {
                'blackhat' => new LlmBlackHat($this->processor),
                'bluehat' => new LlmBlueHat($this->processor),
                'greenhat' => new LlmGreenHat($this->processor),
                'redhat' => new LlmRedHat($this->processor),
                'whitehat' => new LlmWhiteHat($this->processor),
                'yellowhat' => new LlmYellowHat($this->processor),
                'distant writing' => new LlmDistantWriting($this->processor),
                'rewrite' => new LlmRewrite($this->processor),
                'summarize' => new LlmSummarize($this->processor),
                'translate' => new LlmTranslate($this->processor),
                default => throw new InvalidArgumentException("unknown action: {$action}")
            };
        }
    }
?>