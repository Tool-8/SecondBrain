<?php
    namespace Tests\Unit;

    use App\Factories\ImportStrategyFactory;
    use App\Repositories\NoteRepositoryInterface;
    use App\Services\ImportService;
    use App\Strategies\ImportStrategyInterface;
    use Illuminate\Http\UploadedFile;
    use RuntimeException;
    use Tests\TestCase;
    use InvalidArgumentException;

    use PHPUnit\Framework\MockObject\MockObject;

    class ImportServiceTest extends TestCase {
        private NoteRepositoryInterface&MockObject $repository;
        private ImportStrategyFactory&MockObject $factory;
        private ImportService $service;    
        
        protected function setUp(): void {
            parent::setUp();
            $this->repository = $this->createMock(NoteRepositoryInterface::class);
            $this->factory = $this->createMock(ImportStrategyFactory::class);
            $this->service = new ImportService($this->repository, $this->factory);
        } 


        public function test_imports_md_file() {
            $now = now();
            $this->travelTo($now); //freeze time

            $file = UploadedFile::fake()->create('test.md');

            $parsedData = ['title' => 'test', 'content' => '# Prova'];
            $timestamp = $now->format('Y-m-d H:i:s');
            $title = 'test - ' . $timestamp ;

            $strategyMock = $this->createMock(ImportStrategyInterface::class);
            $strategyMock->method('parse')
                ->with($file)
                ->willReturn($parsedData);
            
            $this->factory->expects($this->once())
                ->method('make')
                ->with('md')
                ->willReturn($strategyMock);

            $note = [
                'id' => 'abc',
                'title' => $title,
                'content' => '# Prova',
                'created_at' => $now,
            ];

            $this->repository->expects($this->once())
                ->method('create')
                ->with($title, $parsedData['content'])
                ->willReturn($note);
    
            $result = $this->service->handleUpload($file);
        
            $this->assertEquals($note['id'], $result['id']);
            $this->assertEquals($note['title'], $result['title']);
            $this->assertEquals($note['content'], $result['content']);
            $this->assertEquals($note['created_at'], $result['created_at']);            

            $this->travelBack(); //unfreeze time
        }
    
        public function test_propagates_exception_with_invalid_format() {
            $file = UploadedFile::fake()->create('test.xml');
                
            $this->factory->method('make')
                ->with('xml')
                ->willThrowException(new InvalidArgumentException('xml format is not supported'));
            
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("xml format is not supported");
            
            $this->service->handleUpload($file);
        }

        public function test_throws_exception_when_title_is_used() {
            $now = now();
            $this->travelTo($now); //freeze time

            $file = UploadedFile::fake()->create('test.xml');
            $parsedData = ['title' => 'test', 'content' => '# Prova'];


            $strategyMock = $this->createMock(ImportStrategyInterface::class);
            $strategyMock->method('parse')
                ->with($file)
                ->willReturn($parsedData);
            
            $this->factory->expects($this->once())
                ->method('make')
                ->with('xml')
                ->willReturn($strategyMock);

            $this->repository->expects(($this->once()))
                ->method('isTitleUsed')
                ->willReturn(true);

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('TITLE_IN_USE');

            $this->service->handleUpload($file);
        }
    }
?>