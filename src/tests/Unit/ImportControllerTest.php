<?php
    namespace Tests\Unit;

    use App\Http\Controllers\Api\ImportController;
    use App\Services\ImportService;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Http\UploadedFile;
    use InvalidArgumentException;
    use RuntimeException;
    use PHPUnit\Framework\MockObject\MockObject;
    use Tests\TestCase;
    use App\Models\Note;

    class ImportControllerTest extends TestCase {

        private ImportService&MockObject $service;
        private ImportController $controller;

        protected function setUp(): void {
            parent::setUp();

            $this->service = $this->createMock(ImportService::class);
            $this->controller = new ImportController($this->service);
        }

        public function test_returns_201_with_correct_note_data() {
            $file = UploadedFile::fake()->create('Test.md', 100);
            $note = new Note ('abc', 'Test - 2026-04-21 12:00:00', '');

            $this->service
                ->expects($this->once())
                ->method('handleUpload')
                ->with($file)
                ->willReturn($note);

            $response = $this->controller->__invoke(new Request([],[],[],[],['file' => $file]));

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(201, $response->getStatusCode());
            $this->assertSame($note->getData(), $response->getData(true));
        }

        public function test_returns_400_when_file_extension_is_not_supported() {
            $file = UploadedFile::fake()->create('Test.xml', 100);

            $this->service
                ->expects($this->once())
                ->method('handleUpload')
                ->with($file)
                ->willThrowException(new InvalidArgumentException("xml format is not supported"));

            $response = $this->controller->__invoke(new Request([],[],[],[],['file' => $file]));

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('xml format is not supported', $response->getData(true)['message']);
        }

        public function test_returns_400_when_title_is_already_used() {
            $file = UploadedFile::fake()->create('Test.xml', 100);

            $this->service
                ->expects($this->once())
                ->method('handleUpload')
                ->with($file)
                ->willThrowException(new RuntimeException("TITLE_IN_USE"));

            $response = $this->controller->__invoke(new Request([],[],[],[],['file' => $file]));

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Title already used by another note', $response->getData(true)['message']);
        }

    } 
?>
