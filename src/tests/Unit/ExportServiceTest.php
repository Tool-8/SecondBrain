<?php

    namespace Tests\Unit;

    use App\Services\ExportService;
    use App\Repositories\NoteRepositoryInterface;
    use App\Factories\ExportStrategyFactory;
    use App\Strategies\ExportStrategyInterface;
    use InvalidArgumentException;
    use Tests\TestCase;
    use PHPUnit\Framework\MockObject\MockObject;

    class ExportServiceTest extends TestCase {
        private NoteRepositoryInterface&MockObject $repository;
        private ExportStrategyFactory&MockObject $factory;
        private ExportService $service;
        
        protected function setUp(): void {
            parent::setUp();
            
            $this->repository = $this->createMock(NoteRepositoryInterface::class);
            $this->factory = $this->createMock(ExportStrategyFactory::class);
            $this->service = new ExportService($this->repository, $this->factory);
        }

        public function test_export_md() : void{
            $noteId = '123';
            $note = [
                'title' => "Prova Nota",
                'content_md' => "# Prova"
            ];

            $this->repository->expects($this->once())
                ->method('get')
                ->with($noteId)
                ->willReturn($note);

            $strategyMock = $this->createMock(ExportStrategyInterface::class);
            $strategyMock->method('export')->willReturn('# Prova');
            $strategyMock->method('contentType')->willReturn('text/markdown');
            $strategyMock->method('extension')->willReturn('md');

            $this->factory->expects($this->once())
                ->method('make')
                ->with('md')
                ->willReturn($strategyMock);
            
            $result = $this->service->export($noteId, 'md');

            $this->assertEquals('# Prova', $result['content']);
            $this->assertEquals('text/markdown', $result['content_type']);
            $this->assertEquals('Prova Nota.md', $result['filename']);
        }

        public function test_export_html() : void{
            $noteId = '123';
            $note = [
                'title' => "Prova Nota",
                'content_md' => "# Prova"
            ];

            $this->repository->expects($this->once())
                ->method('get')
                ->with($noteId)
                ->willReturn($note);

            $html_content = '
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>Prova Nota</title>
            </head>
            <body>
                <h1>Prova</h1>
            </body>
            </html>
            ';

            $strategyMock = $this->createMock(ExportStrategyInterface::class);
            $strategyMock->method('export')->willReturn($html_content);
            $strategyMock->method('contentType')->willReturn('text/html');
            $strategyMock->method('extension')->willReturn('html');

            $this->factory->expects($this->once())
                ->method('make')
                ->with('html')
                ->willReturn($strategyMock);
            
            
            $result = $this->service->export($noteId, 'html');

            $this->assertEquals($html_content, $result['content']);
            $this->assertEquals('text/html', $result['content_type']);
            $this->assertEquals('Prova Nota.html', $result['filename']);

        }
        
        public function test_export_pdf() : void{
            $noteId = '123';
            $note = [
                'title' => "Prova Nota",
                'content_md' => "# Prova"
            ];
            $this->repository->expects($this->once())
                ->method('get')
                ->with($noteId)
                ->willReturn($note);
            
            $strategyMock = $this->createMock(ExportStrategyInterface::class);
            $strategyMock->method('export')->willReturn('%PDF');
            $strategyMock->method('contentType')->willReturn('application/pdf');
            $strategyMock->method('extension')->willReturn('pdf');

            $this->factory->expects($this->once())
                ->method('make')
                ->with('pdf')
                ->willReturn($strategyMock);

            $result = $this->service->export($noteId, 'pdf');
            
            $this->assertEquals("%PDF", $result['content']);
            $this->assertEquals('application/pdf', $result['content_type']);
            $this->assertEquals('Prova Nota.pdf', $result['filename']);
        }
        
        public function test_propagates_exception_with_invalid_format(){

            $noteId = '123';
            $note = [
                'title' => "Prova Nota",
                'content_md' => "Prova"
            ];
            $this->repository->expects($this->once())
                ->method('get')
                ->with($noteId)
                ->willReturn($note);
                
            $this->factory->method('make')
                ->willThrowException(new InvalidArgumentException('Unknown format: xml'));
            
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("Unknown format: xml");
            
            $this->service->export('123', 'xml');
        }
    }
    
?>