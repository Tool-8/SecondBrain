<?php
namespace Tests\Unit;

use App\Http\Controllers\Api\LlmController;
use App\Services\LlmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\TestCase;
use RuntimeException;

class LlmControllerTest extends TestCase {
    private LlmService&MockObject $service;
    private LlmController $controller;

    protected function setUp(): void {
        parent::setUp();
        $this->service = $this->createMock(LlmService::class);
        $this->controller = new LlmController($this->service);
    }

    public function test_correct_response_with_summarize(): void {
        $this->service
            ->expects($this->once())
            ->method('process')
            ->with('Testo da processare', 'summarize', [])
            ->willReturn('Testo prodotto');

        $request = Request::create('/llm/summarize', 'POST', [
            'content' => 'Testo da processare',
        ]);

        $response = $this->controller->summarize($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Testo prodotto', $response->getData(true)['result']);
    }

    public function test_correct_response_with_translate(): void {
        $this->service
            ->expects($this->once())
            ->method('process')
            ->with('some text', 'translate', ['lang' => 'en'])
            ->willReturn('translated text');

        $request = Request::create('/llm/translate', 'POST', [
            'content' => 'some text',
            'lang'    => 'en',
        ]);

        $response = $this->controller->translate($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('translated text', $response->getData(true)['result']);
    }

    public function test_correct_response_with_rewrite(): void {
        $this->service
            ->expects($this->once())
            ->method('process')
            ->with('some text', 'rewrite', ['style' => ['lexicon']])
            ->willReturn('testo riscritto');

        $request = Request::create('/llm/rewrite', 'POST', [
            'content' => 'some text',
            'style'   => ['lexicon'],
        ]);

        $response = $this->controller->rewrite($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('testo riscritto', $response->getData(true)['result']);
    }

    public function test_correct_response_with_hat(): void {
        $this->service
            ->expects($this->once())
            ->method('process')
            ->with('some text', 'blackhat', [])
            ->willReturn('risultato blackhat');

        $request = Request::create('/llm/hat/blackhat', 'POST', [
            'content' => 'some text',
        ]);

        $response = $this->controller->hat($request, 'blackhat');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('risultato blackhat', $response->getData(true)['result']);
    }

    public function test_correct_response_with_distant_writing(): void {
        $this->service
            ->expects($this->once())
            ->method('process')
            ->with('Testo da processare', 'distant writing', [])
            ->willReturn('Testo generato');

        $request = Request::create('/llm/distant-writing', 'POST', [
            'content' => 'Testo da processare',
        ]);

        $response = $this->controller->distantWriting($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Testo generato', $response->getData(true)['result']);
    }

    public function test_summarize_throws_validation_exception_without_content(): void {
        $this->expectException(ValidationException::class);

        $request = Request::create('/llm/summarize', 'POST', []);
        $this->controller->summarize($request);
    }

    public function test_translate_throws_validation_exception_with_unsupported_lang(): void {
        $this->expectException(ValidationException::class);

        $request = Request::create('/llm/translate', 'POST', [
            'content' => 'some text',
            'lang'    => 'zh',
        ]);
        $this->controller->translate($request);
    }

    public function test_rewrite_throws_validation_exception_without_style(): void {
        $this->expectException(ValidationException::class);

        $request = Request::create('/llm/rewrite', 'POST', [
            'content' => 'some text',
        ]);
        $this->controller->rewrite($request);
    }

    public function test_summarize_returns_502_on_llm_error(): void {
        $this->service
            ->method('process')
            ->willThrowException(new RuntimeException('Errore LLM 500: Internal Server Error'));

        $request = Request::create('/llm/summarize', 'POST', [
            'content' => 'some text',
        ]);

        $response = $this->controller->summarize($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(502, $response->getStatusCode());
        $this->assertSame('Errore LLM 500: Internal Server Error', $response->getData(true)['message']);
    }

    public function test_hat_returns_400_with_invalid_type(): void {
        $request = Request::create('/llm/hat/purplehat', 'POST', [
            'content' => 'some text',
        ]);

        $response = $this->controller->hat($request, 'purplehat');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(400, $response->getStatusCode());
    }

    
}