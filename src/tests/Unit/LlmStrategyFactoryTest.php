<?php
    namespace Tests\Unit;

    use App\Factories\LlmStrategyFactory;
    use App\Utilities\LlmResponseProcessor;
    use PHPUnit\Framework\MockObject\MockObject;
    use Tests\TestCase;
    use InvalidArgumentException;
    use App\Strategies\LlmBlackHat;
    use App\Strategies\LlmBlueHat;
    use App\Strategies\LlmRedHat;
    use App\Strategies\LlmWhiteHat;
    use App\Strategies\LlmYellowHat;
    use App\Strategies\LlmGreenHat;
    use App\Strategies\LlmDistantWriting;
    use App\Strategies\LlmRewrite;
    use App\Strategies\LlmSummarize;
    use App\Strategies\LlmTranslate;


    class LlmStrategyFactoryTest extends TestCase {
        
        private LlmStrategyFactory $factory;
        private LlmResponseProcessor&MockObject $processor;

        protected function setUp(): void {
            parent::setUp();
            $this->processor = $this->createMock(LlmResponseProcessor::class);
            $this->factory = new LlmStrategyFactory($this->processor);
        }

        public function test_return_black_hat_strategy_istance() {
            $this->assertInstanceOf(LlmBlackHat::class, $this->factory->make('blackhat'));
        }
        public function test_return_blue_hat_strategy_istance() {
            $this->assertInstanceOf(LlmBlueHat::class, $this->factory->make('bluehat'));
        }
        public function test_return_green_hat_strategy_istance() {
            $this->assertInstanceOf(LlmGreenHat::class, $this->factory->make('greenhat'));
        }
        public function test_return_red_hat_strategy_istance() {
            $this->assertInstanceOf(LlmRedHat::class, $this->factory->make('redhat'));
        }
        public function test_return_white_hat_strategy_istance() {
            $this->assertInstanceOf(LlmWhiteHat::class, $this->factory->make('whitehat'));
        }
        public function test_return_yellow_hat_strategy_istance() {
            $this->assertInstanceOf(LlmYellowHat::class, $this->factory->make('yellowhat'));
        }
        public function test_return_distant_writing_strategy_istance() {
            $this->assertInstanceOf(LlmDistantWriting::class, $this->factory->make('distant writing'));
        }
        public function test_return_rewrite_strategy_istance() {
            $this->assertInstanceOf(LlmRewrite::class, $this->factory->make('rewrite'));
        }
        public function test_return_summarize_strategy_istance() {
            $this->assertInstanceOf(LlmSummarize::class, $this->factory->make('summarize'));
        }
        public function test_return_translate_strategy_istance() {
            $this->assertInstanceOf(LlmTranslate::class, $this->factory->make('translate'));
        }

        public function test_throws_exception_with_invalid_format() {
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("unknown action: expand");

            $this->factory->make('expand');
        }
    }
?>