<?php
    namespace Tests\Feature;

    use App\Utilities\LlmResponseProcessor;
    use Tests\TestCase;
    use Illuminate\Support\Facades\Http;
    use RuntimeException;


    class LlmTest extends TestCase {

        protected function setUp(): void {

            parent::setUp();

        }

        public function test_simple_action() {
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
            $response = $this->postJson('api/llm', [
                'content' => 'Testo da processare',
                'action' => 'summarize'
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment(['result' => 'Risposta generata dal modello']);
        }

        public function test_rewrite_action() {
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
            $response = $this->postJson('api/llm', [
                'content' => 'Testo da processare',
                'action' => 'rewrite',
                'options' => ['style' => ['grammar','lexicon']]
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment(['result' => 'Risposta generata dal modello']);
        }

        public function test_translate_action() {
            Http::fake([
                '*' => Http::response([
                    'choices' => [
                        ['message' => [
                            'content' => 'Testo tradotto'
                            ]
                        ]
                    ]
                ], 200)
            ]);
            $response = $this->postJson('api/llm', [
                'content' => 'Testo da processare',
                'action' => 'translate',
                'options' => ['lang' => 'en']
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment(['result' => 'Testo tradotto']);
        }

        public function test_invalid_action() {
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
            $response = $this->postJson('api/llm', [
                'content' => 'Testo da processare',
                'action' => 'inject'
            ]);

            $response->assertStatus(422)
                ->assertJsonFragment(['action' => ['The selected action is invalid.']]);
        }

        public function test_llm_error() {
            Http::fake([
                '*' => Http::response([
                    'error' => ['message' => 'Internal Server Error']], 500)
            ]);
            $response = $this->postJson('api/llm', [
                'content' => 'Testo da processare',
                'action' => 'summarize'
            ]);

            $this->mock(LlmResponseProcessor::class)
                ->shouldReceive('handleError')
                ->andThrow(new RuntimeException('Errore LLM 500: Internal Server Error'));

            $response->assertStatus(502)
                ->assertJsonFragment(['message' => 'Errore LLM 500: Internal Server Error']);
        }
}