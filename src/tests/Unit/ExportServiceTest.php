<?php

    namespace Tests\Unit;

    use App\Services\ExportService;
    use App\Repositories\NoteRepositoryInterface;
    use App\Factories\ExportStrategyFactory;
    use InvalidArgumentException;
    use Tests\TestCase;
    use PHPUnit\Framework\MockObject\MockObject;

    use Mockery;

    class ExportServiceTest extends TestCase {
        private NoteRepositoryInterface&MockObject $repository;
        private ExportService $service;
        
        protected function setUp(): void {
            parent::setUp();
            
            $this->repository = $this->createMock(NoteRepositoryInterface::class);
            $this->service = new ExportService($this->repository);
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
            
            $result = $this->service->export($noteId, 'html');
            
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
            
            $result = $this->service->export($noteId, 'pdf');
            
            $this->assertStringStartsWith("%PDF", $result['content']);
            $this->assertEquals('application/pdf', $result['content_type']);
            $this->assertEquals('Prova Nota.pdf', $result['filename']);
        }
        
        #[\PHPUnit\Framework\Attributes\RunInSeparateProcess]
        #[\PHPUnit\Framework\Attributes\PreserveGlobalState(false)]
        
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
                
            $factoryMock = Mockery::mock('alias:' . ExportStrategyFactory::class);
            $factoryMock->shouldReceive('make')->once()->with('xml')->andThrows(InvalidArgumentException::class, "Unknown format: xml");
            
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("Unknown format: xml");
            
            $this->service->export('123', 'xml');
        }
    }
    
?>