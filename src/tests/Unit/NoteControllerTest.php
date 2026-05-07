<?php

    namespace Tests\Unit;

    use App\Http\Controllers\Api\NoteController;
    use App\Services\NoteService;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use PHPUnit\Framework\MockObject\MockObject;
    use RuntimeException;
    use Tests\TestCase;
    use App\Models\Note;

    class NoteControllerTest extends TestCase {
        private NoteService&MockObject $noteService;
        private NoteController $controller;

        protected function setUp(): void {
            parent::setUp();

            $this->noteService = $this->createMock(NoteService::class);
            $this->controller  = new NoteController($this->noteService);
        }

        public function test_index_returns_200_with_list(): void {
            $notes = [
                new Note ('1', 'Note A', 'Hello'),
                new Note ('2', 'Note B', 'World'),
            ];

            $this->noteService
                ->expects($this->once())
                ->method('list')
                ->willReturn($notes);

            $response = $this->controller->index();

            $data = array_map(fn($note) => $note->getData(), $notes);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($data, $response->getData(true));
        }

        public function test_index_returns_empty_array_when_no_notes(): void {
            $this->noteService
                ->expects($this->once())
                ->method('list')
                ->willReturn([]);

            $response = $this->controller->index();

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame([], $response->getData(true));
        }

        public function test_show_returns_200_with_note(): void {
            $note = new Note('abc', 'Test', '# Hello');

            $this->noteService
                ->expects($this->once())
                ->method('get')
                ->with('abc')
                ->willReturn($note);

            $response = $this->controller->show('abc');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($note->getData(), $response->getData(true));
        }

        public function test_show_returns_404_when_not_found(): void {
            $this->noteService
                ->method('get')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $response = $this->controller->show('missing-id');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(404, $response->getStatusCode());
            $this->assertSame('Note not found', $response->getData(true)['message']);
        }

        public function test_show_returns_400_when_invalid_id(): void {
            $this->noteService
                ->method('get')
                ->willThrowException(new RuntimeException('INVALID_ID'));

            $response = $this->controller->show('!!!');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Invalid note id', $response->getData(true)['message']);
        }

        public function test_store_returns_201_with_created_note(): void {
            $created = new Note('xyz', 'New Note', 'body');

            $this->noteService
                ->expects($this->once())
                ->method('create')
                ->with('New Note', 'body')
                ->willReturn($created);

            $request  = Request::create('/notes', 'POST', [
                'title'      => 'New Note',
                'content_md' => 'body',
            ]);

            $response = $this->controller->store($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(201, $response->getStatusCode());
            $this->assertSame($created->getData(), $response->getData(true));
        }

        public function test_store_uses_empty_string_when_content_md_is_absent(): void {
            $emptyNote = new Note('1', 'Only Title', '');
            
            $this->noteService
                ->expects($this->once())
                ->method('create')
                ->with('Only Title', '')
                ->willReturn($emptyNote);

            $request = Request::create('/notes', 'POST', ['title' => 'Only Title']);

            $response = $this->controller->store($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(201, $response->getStatusCode());
            $this->assertSame($emptyNote->getData(), $response->getData(true));
        }

        public function test_store_returns_409_when_title_in_use(): void {
            $this->noteService
                ->method('create')
                ->willThrowException(new RuntimeException('TITLE_IN_USE'));

            $request = Request::create('/notes', 'POST', [
                'title'      => 'Duplicate',
                'content_md' => '',
            ]);

            $response = $this->controller->store($request);

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(409, $response->getStatusCode());
            $this->assertSame('Title already used', $response->getData(true)['message']);
        }

        public function test_update_returns_200_with_updated_note(): void {
            $updated = new Note('1', 'Renamed', 'New body');

            $this->noteService
                ->expects($this->once())
                ->method('update')
                ->with('1', 'Renamed', 'New body')
                ->willReturn($updated);

            $request = Request::create('/notes/1', 'PUT', [
                'title'      => 'Renamed',
                'content_md' => 'New body',
            ]);

            $response = $this->controller->update($request, '1');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(200, $response->getStatusCode());
            $this->assertSame($updated->getData(), $response->getData(true));
        }

        public function test_update_returns_404_when_note_not_found(): void {
            $this->noteService
                ->method('update')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $request = Request::create('/notes/999', 'PUT', [
                'title'      => 'X',
                'content_md' => '',
            ]);

            $response = $this->controller->update($request, '999');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(404, $response->getStatusCode());
            $this->assertSame('Note not found', $response->getData(true)['message']);

        }

        public function test_update_returns_409_when_title_in_use(): void {
            $this->noteService
                ->method('update')
                ->willThrowException(new RuntimeException('TITLE_IN_USE'));

            $request = Request::create('/notes/1', 'PUT', [
                'title'      => 'Already taken',
                'content_md' => '',
            ]);

            $response = $this->controller->update($request, '1');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(409, $response->getStatusCode());
            $this->assertSame('Title already used', $response->getData(true)['message']);
        }

        public function test_update_returns_400_when_invalid_id(): void {
            $this->noteService
                ->method('update')
                ->willThrowException(new RuntimeException('INVALID_ID'));

            $request = Request::create('/notes/@@', 'PUT', [
                'title'      => 'Any',
                'content_md' => '',
            ]);

            $response = $this->controller->update($request, '@@');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Invalid note id', $response->getData(true)['message']);
        }

        public function test_destroy_returns_204_on_success(): void {
            $this->noteService
                ->expects($this->once())
                ->method('delete')
                ->with('abc');

            $response = $this->controller->destroy('abc');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(204, $response->getStatusCode());
        }

        public function test_destroy_returns_404_when_not_found(): void {
            $this->noteService
                ->method('delete')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $response = $this->controller->destroy('ghost');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(404, $response->getStatusCode());
            $this->assertSame('Note not found', $response->getData(true)['message']);
        }

        public function test_destroy_returns_500_when_delete_failed(): void {
            $this->noteService
                ->method('delete')
                ->willThrowException(new RuntimeException('DELETE_FAILED'));

            $response = $this->controller->destroy('1');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(500, $response->getStatusCode());
            $this->assertSame('Failed to delete', $response->getData(true)['message']);
        }

        public function test_destroy_returns_400_when_invalid_id(): void {
            $this->noteService
                ->method('delete')
                ->willThrowException(new RuntimeException('INVALID_ID'));

            $response = $this->controller->destroy('!!!');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(400, $response->getStatusCode());
            $this->assertSame('Invalid note id', $response->getData(true)['message']);
        }

        public function test_unknown_runtime_exception_returns_500_server_error(): void {
            $this->noteService
                ->method('get')
                ->willThrowException(new RuntimeException('SOMETHING_UNEXPECTED'));

            $response = $this->controller->show('1');

            $this->assertInstanceOf(JsonResponse::class, $response);
            $this->assertSame(500, $response->getStatusCode());
            $this->assertSame('Server error', $response->getData(true)['message']);
        }
    }
?>