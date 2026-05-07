<?php
    namespace Tests\Unit;
    use App\Utilities\LlmResponseProcessor;
    use PHPUnit\Framework\MockObject\MockObject;
    use RuntimeException;
    use Tests\TestCase;
    use App\Strategies\LlmRedHat;
    use Illuminate\Support\Facades\Http;
    use App\Utilities\Context;

    class LlmRedHatTest extends TestCase {
        private LlmRedHat $strategy;
        private LlmResponseProcessor&MockObject $processor;

        protected function setUp(): void {
            parent::setUp();

            $this->processor = $this->createMock(LlmResponseProcessor::class);
            $this->strategy = new LlmRedHat($this->processor);
        }

        public function test_returns_generated_text_on_success() : void {
            Http::fake([
                '*' => Http::response([
                    'choices' => [
                        ['message' => [
                            'content' => 'Risposta generata dal modello'
                            ]
                        ]
                    ]
                ], 200)
            ]);

            $fakeResponse = Http::post("some_url");
            $this->processor
                ->expects($this->once())
                ->method('make')
                ->willReturn($fakeResponse);

            $this->processor
                ->expects($this->once())
                ->method('handleError')
                ->with($fakeResponse);

            $context = new Context('Testo da processare');
            $result = $this->strategy->process($context);

            $this->assertSame('Risposta generata dal modello', $result);
        }

        public function test_throws_exception_when_response_not_ok() : void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage("Errore LLM 500: Internal Server Error");
            
            Http::fake([
                '*' => Http::response([
                    'error' => ['message' => 'Internal Server Error']], 500)
            ]);

            $fakeResponse = Http::post("some_url");
            $this->processor
                ->expects($this->once())
                ->method('make')
                ->willReturn($fakeResponse);

            $this->processor
                ->expects($this->once())
                ->method('handleError')
                ->with($fakeResponse)
                ->willThrowException(new RuntimeException('Errore LLM 500: Internal Server Error'));

            $context = new Context('Testo da processare');
            $this->strategy->process($context);
        }

        public function test_returns_fallback_when_content_is_missing() : void {
            
            Http::fake([
                '*' => Http::response([], 200)
            ]);

            $context = new Context('Testo da processare');
            $result = $this->strategy->process($context);
            $this->assertSame('Risposta vuota', $result);
        }
    }
?>