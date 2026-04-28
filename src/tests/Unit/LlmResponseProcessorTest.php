<?php
    namespace Tests\Unit;

    use Tests\TestCase;
    use App\Utilities\LlmResponseProcessor;
    use Illuminate\Support\Facades\Http;
    use Illuminate\Http\Client\Response;
    use RuntimeException;


    class LlmResponseProcessorTest extends TestCase {

        private LlmResponseProcessor $processor;

        protected function setUp() : void {
            parent::setUp();

            config(['services.llm.api_key' => 'test-key']);
            config(['services.llm.base_url' => 'test-url.com']);
            config(['services.llm.model' => 'test-model4.0']);

            $this->processor = new LlmResponseProcessor();
        }

        public function test_make_returns_response() {
            Http::fake([
                '*' => Http::response([
                    'choices' => [
                        ['message' => [
                            'content' => 'ok'
                            ]
                        ]
                    ]
                ], 200)
            ]);

            $response = $this->processor->make('prompt', 'testo');

            $this->assertInstanceOf(Response::class, $response);
            $this->assertEquals(200, $response->status());

            Http::assertSent(function($request) {
                return $request->hasHeader('Authorization', 'Bearer test-key') &&
                    $request['model'] === 'test-model4.0' &&
                    $request['messages'][0]['content'] === 'prompt' &&
                    $request['messages'][1]['content'] === 'testo';
            });
        }

        public function test_throws_runtime_exception_when_response_not_ok() {
            Http::fake([
                '*' => Http::response(['error' => ['message' => 'Invalid API Key']], 401)
            ]);

            $response = $this->processor->make('prompt', 'test');

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('Errore LLM 401: Invalid API Key');

            $this->processor->handleError($response);
        }
    }

?>