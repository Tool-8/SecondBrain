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
    use InvalidArgumentException;

    class LlmControllerTest extends TestCase {
        private LlmService&MockObject $service;
        private LlmController $controller;
    
        protected function setUp(): void {
            parent::setUp();
            $this->service = $this->createMock(LlmService::class);
            $this->controller = new LlmController($this->service);
        }

        public function test_correct_response_with_simple_action(){
            $this->service
                ->expects($this->once())
                ->method('process')
                ->with('Testo da processare', 'summarize', [])
                ->willReturn('Testo prodotto');

            $request = Request::create('/llm', 'POST', [
                'content' => 'Testo da processare',
                'action' => 'summarize'
            ]);
            
            $response = $this->controller->__invoke($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame('Testo prodotto', $response->getData(true)['result']);
            
        }

        public function test_correct_response_with_translate(){
            $created = 'translated text';
            $this->service
                ->expects($this->once())
                ->method('process')
                ->with('some text', 'translate', ['lang' => 'en'])
                ->willReturn($created);

            $request  = Request::create('/llm', 'POST', [
                'content'      => 'some text',
                'action' => 'translate',
                'options' => ['lang' => 'en']
            ]);

            $response = $this->controller->__invoke($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($created, $response->getData(true)['result']);

        }
        
        public function test_correct_response_with_rewrite(){
            $created = 'testo riscritto';
            $this->service
                ->expects($this->once())
                ->method('process')
                ->with('some text', 'rewrite', ['style' => ['lexicon']])
                ->willReturn($created);

            $request  = Request::create('/llm', 'POST', [
                'content'      => 'some text',
                'action' => 'rewrite',
                'options' => ['style' => ['lexicon']]
            ]);

            $response = $this->controller->__invoke($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($created, $response->getData(true)['result']);
        }
        
        public function test_throw_exception_with_invalid_action(){
            $this->expectException(ValidationException::class);

            $request  = Request::create('/llm', 'POST', [
                'content'      => 'some text',
                'action' => 'inject',
                'options' => ['style' => ['lexicon']]
            ]);
            $response = $this->controller->__invoke($request);
        }
        
        public function test_throw_exception_with_llm_error(){
            $this->service
                ->method('process')
                ->willThrowException(new RuntimeException('Errore LLM 500: Internal Server Error'));
                
            $request  = Request::create('/llm', 'POST', [
                'content'      => 'some text',
                'action' => 'rewrite',
                'options' => ['style' => ['lexicon']]
            ]);
            $response = $this->controller->__invoke($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(502, $response->getStatusCode());
            $this->assertSame('Errore LLM 500: Internal Server Error', $response->getData(true)['message']);
        }   
}
?>