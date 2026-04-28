<?php

    namespace Tests\Unit;

    use App\Repositories\NoteRepositoryInterface;
    use App\Services\NoteService;
    use PHPUnit\Framework\MockObject\MockObject;
    use RuntimeException;
    use Tests\TestCase;
    use App\Models\Note;

    class NoteServiceTest extends TestCase
    {
        private NoteService $service;
        private NoteRepositoryInterface&MockObject $repository;

        protected function setUp(): void {
            parent::setUp();

            $this->repository = $this->createMock(NoteRepositoryInterface::class);
            $this->service    = new NoteService($this->repository);
        }

        public function test_list_returns_array_from_repository(): void {
            $expected = [
                new Note('abc', 'Nota 1', '# Prima Nota'),
                new Note('def', 'Nota 2', '# Second Nota')
            ];

            $this->repository
                ->expects($this->once())
                ->method('list')
                ->willReturn($expected);

            $result = $this->service->list();

            $this->assertSame($expected, $result);
            $this->assertInstanceOf(Note::class, $result[0]) ;
        }

        public function test_get_returns_note_from_repository(): void {
            $expected = new Note('abc', 'Nota', 'Contenuto');

            $this->repository
                ->expects($this->once())
                ->method('get')
                ->with('abc')
                ->willReturn($expected);

            $result = $this->service->get('abc');
            $this->assertInstanceOf(Note::class, $result);
            $this->assertSame($expected, $result);
        }

        public function test_get_propagates_not_found_exception(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repository
                ->method('get')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $this->service->get('abc');
        }

        public function test_create_returns_note_when_title_is_available(): void {
            $expected = new Note('abc', 'Nuova nota', '');

            $this->repository
                ->method('isTitleUsed')
                ->with('Nuova nota')
                ->willReturn(false);

            $this->repository
                ->expects($this->once())
                ->method('create')
                ->with('Nuova nota', '')
                ->willReturn($expected);

            $result = $this->service->create('Nuova nota', '');
            
            $this->assertInstanceOf(Note::class, $result);
            $this->assertSame($expected, $result);
        }

        public function test_create_throws_when_title_is_already_used(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('TITLE_IN_USE');

            $this->repository
                ->method('isTitleUsed')
                ->with('Titolo duplicato')
                ->willReturn(true);

            $this->repository
                ->expects($this->never())
                ->method('create');

            $this->service->create('Titolo duplicato', '');
        }

        public function test_update_returns_note_when_title_is_available(): void {
            $expected = new Note('abc', 'Titolo aggiornato', 'Nuovo contenuto');

            $this->repository
                ->method('isTitleUsed')
                ->with('Titolo aggiornato', 'abc')
                ->willReturn(false);

            $this->repository
                ->expects($this->once())
                ->method('update')
                ->with('abc', 'Titolo aggiornato', 'Nuovo contenuto')
                ->willReturn($expected);

            $result = $this->service->update('abc', 'Titolo aggiornato', 'Nuovo contenuto');

            $this->assertInstanceOf(Note::class, $result);
            $this->assertSame($expected, $result);
        }

        public function test_update_throws_when_title_is_already_used_by_another_note(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('TITLE_IN_USE');

            $this->repository
                ->method('isTitleUsed')
                ->with('Titolo duplicato', 'abc')
                ->willReturn(true);

            $this->repository
                ->expects($this->never())
                ->method('update');

            $this->service->update('abc', 'Titolo duplicato', '');
        }

        public function test_update_allows_same_title_on_same_note(): void {
            $expected = new Note('abc', 'Stesso titolo', 'Contenuto');

            $this->repository
                ->method('isTitleUsed')
                ->with('Stesso titolo', 'abc')
                ->willReturn(false); 

            $this->repository
                ->expects($this->once())
                ->method('update')
                ->with('abc', 'Stesso titolo', 'Contenuto')
                ->willReturn($expected);

            $result = $this->service->update('abc', 'Stesso titolo', 'Contenuto');

            $this->assertInstanceOf(Note::class, $result);
            $this->assertSame($expected, $result);
        }

        public function test_update_propagates_not_found_exception(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repository
                ->method('isTitleUsed')
                ->willReturn(false);

            $this->repository
                ->method('update')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $this->service->update('abc', 'Titolo', '');
        }

        public function test_delete_calls_repository_delete(): void {
            $this->repository
                ->expects($this->once())
                ->method('delete')
                ->with('abc');

            $this->service->delete('abc');
        }

        public function test_delete_propagates_not_found_exception(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repository
                ->method('delete')
                ->willThrowException(new RuntimeException('NOT_FOUND'));

            $this->service->delete('abc');
        }

        public function test_delete_propagates_invalid_id_exception(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('INVALID_ID');

            $this->repository
                ->method('delete')
                ->willThrowException(new RuntimeException('INVALID_ID'));

            $this->service->delete('id-non-valido');
        }
        
        public function test_delete_propagates_delete_failed_exception(): void {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('DELETE_FAILED');

            $this->repository
                ->method('delete')
                ->willThrowException(new RuntimeException('DELETE_FAILED'));

            $this->service->delete('abc');
        }
    }
?>