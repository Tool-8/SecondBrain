<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class LlmTest extends TestCase {

    protected function setUp(): void {
        parent::setUp();
    }

    public function test_summarize_action_success() {
        Http::fake([
            '*' => Http::response([
                'choices' => [['message' => ['content' => 'Risposta generata dal modello']]]
            ], 200)
        ]);

        $response = $this->postJson('api/llm/summarize', [
            'content' => 'Testo da processare',
        ]);

        $response->assertStatus(200)
            ->assertJson(['result' => 'Risposta generata dal modello']);
    }

    public function test_rewrite_action_success() {
        Http::fake([
            '*' => Http::response([
                'choices' => [['message' => ['content' => 'Testo riscritto']]]
            ], 200)
        ]);

        $response = $this->postJson('api/llm/rewrite', [
            'content' => 'Testo da processare',
            'style' => ['grammar', 'lexicon']
        ]);

        $response->assertStatus(200)
            ->assertJson(['result' => 'Testo riscritto']);
    }

    public function test_translate_action_success() {
        Http::fake([
            '*' => Http::response([
                'choices' => [['message' => ['content' => 'Testo tradotto']]]
            ], 200)
        ]);

        $response = $this->postJson('api/llm/translate', [
            'content' => 'Testo da processare',
            'lang' => 'en'
        ]);

        $response->assertStatus(200)
            ->assertJson(['result' => 'Testo tradotto']);
    }

    public function test_distant_writing_action_success() {
        Http::fake([
            '*' => Http::response([
                'choices' => [['message' => ['content' => 'Testo generato']]]
            ], 200)
        ]);

        $response = $this->postJson('api/llm/distant-writing', [
            'content' => 'Testo da processare',
        ]);

        $response->assertStatus(200)
            ->assertJson(['result' => 'Testo generato']);
    }

    public function test_redhat_action_success() {
        Http::fake([
            '*' => Http::response([
                'choices' => [['message' => ['content' => 'Testo criticato']]]
            ], 200)
        ]);

        $response = $this->postJson('api/llm/hat/redhat', [
            'content' => 'Testo da processare',
        ]);

        $response->assertStatus(200)
            ->assertJson(['result' => 'Testo criticato']);
    }

    public function test_invalid_lang() {
        $response = $this->postJson('api/llm/translate', [
            'content' => 'Testo da processare',
            'lang' => 'al'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lang']);
        
        $this->assertEquals(
            'Translation in al is not supported.', 
            $response->json('errors.lang.0')
        );
    }

    public function test_invalid_rewrite_style() {
        $response = $this->postJson('api/llm/rewrite', [
            'content' => 'Testo da processare',
            'style' => ['rizz']
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['style.0']);
    }

    public function test_invalid_hat_type() {
        $response = $this->postJson('api/llm/hat/purplehat', [
            'content' => 'Idea'
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => "Hat 'purplehat' not supported."]);
    }

    public function test_llm_service_error_returns_502() {
        $this->mock(\App\Services\LlmService::class, function ($mock) {
            $mock->shouldReceive('process')
                 ->andThrow(new \RuntimeException('Errore LLM 500: Internal Server Error'));
        });

        $response = $this->postJson('api/llm/summarize', [
            'content' => 'Testo da processare',
        ]);

        $response->assertStatus(502)
            ->assertJson(['message' => 'Errore LLM 500: Internal Server Error']);
    }
}
