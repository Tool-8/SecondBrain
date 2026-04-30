<?php

    namespace Tests\Unit;

    use App\Http\Controllers\Api\ExportController;
    use App\Services\ExportService;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Http\Response;
    use InvalidArgumentException;
    use PHPUnit\Framework\MockObject\MockObject;
    use RuntimeException;
    use Tests\TestCase;

    class ExportControllerTest extends TestCase {

        private ExportService&MockObject $service;
        private ExportController $controller;

        protected function setUp(): void {
            parent::setUp();

            $this->service = $this->createMock(ExportService::class); 
            $this->controller = new ExportController($this->service);
            
        }

        public function test_invoke_returns_200_with_note_with_id(): void {
            $exportedNote = ['content' => '# Conent', 'content_type' => 'text/md', 'filename' => 'Note.md'];

            $this->service
                ->expects($this->once())
                ->method('export')
                ->with('abc', 'md')
                ->willReturn($exportedNote);

            $response = $this->controller->export(new Request(['format' => 'md']), 'abc');

            $this->assertInstanceOf(Response::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($exportedNote["content"], $response->getContent());
            $this->assertSame($exportedNote["content_type"], $response->headers->get('Content-Type'));
            $this->assertSame('attachment; filename="'. $exportedNote['filename'] . '"' , $response->headers->get('Content-Disposition'));
        }

        public function test_invoke_returns_200_with_note_without_id(): void {
            $exportedNote = ['content' => '# Content', 'content_type' => 'text/md', 'filename' => 'Note.md'];

            $this->service
                ->expects($this->once())
                ->method('exportRaw')
                ->with('Note', '# Content', 'md')
                ->willReturn($exportedNote);

            $response = $this->controller->exportRaw(new Request(['format' => 'md', 'title' => 'Note', 'content' => '# Content'] ));

            $this->assertInstanceOf(Response::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($exportedNote["content"], $response->getContent());
            $this->assertSame($exportedNote["content_type"], $response->headers->get('Content-Type'));
            $this->assertSame('attachment; filename="'. $exportedNote['filename'] . '"' , $response->headers->get('Content-Disposition'));
        }

        public function test_invoke_returns_404_when_not_found(): void {
            $this->service
                ->method('export')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $response = $this->controller->export(new Request(['format' => 'md']), 'abc');
            
            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(404, $response->getStatusCode());
            $this->assertSame('Note not found', $response->getData(true)['message']);
        }

        public function test_invoke_returns_400_when_invalid_id(): void {
            $this->service
                ->method('export')
                ->willThrowException(new RuntimeException('INVALID_ID'));

            $response = $this->controller->export(new Request(['format' => 'md']), 'abc');


            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Invalid note id', $response->getData(true)['message']);
        }

        public function test_invoke_returns_400_when_unknown_format_with_id(): void {
            $this->service
                ->method('export')
                ->with('abc', 'mdma')
                ->willThrowException(new InvalidArgumentException('Unknown format: mdma'));

            $response = $this->controller->export(new Request(['format' => 'mdma']), 'abc');


            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Unknown format: mdma', $response->getData(true)['message']);
        }

        public function test_invoke_returns_400_when_unknown_format_without_id(): void {
            $this->service
                ->method('exportRaw')
                ->with('Nota', '# Content', 'mdma')
                ->willThrowException(new InvalidArgumentException('Unknown format: mdma'));

            $response = $this->controller->exportRaw(new Request(['format' => 'mdma', 'title' => 'Nota', 'content' => '# Content']));


            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Unknown format: mdma', $response->getData(true)['message']);
        }

        public function test_unknown_runtime_exception_returns_500_server_error(): void {
            $this->service
                ->method('export')
                ->willThrowException(new RuntimeException('SOMETHING_UNEXPECTED'));

            $response = $this->controller->export(new Request(['format' => 'some_format']), 'ab');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(500, $response->getStatusCode());
            $this->assertSame('Server error', $response->getData(true)['message']);
        }

    }