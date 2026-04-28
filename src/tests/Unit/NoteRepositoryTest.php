<?php
    namespace Tests\Unit;

    use App\Repositories\NoteRepository;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use RuntimeException;
    use Tests\TestCase;
    use App\Models\Note;
    use Mockery;

    class NoteRepositoryTest extends TestCase {
        private NoteRepository $repo;

        protected function setUp(): void
        {
            parent::setUp();
            Storage::fake('local');
            $this->repo = new NoteRepository();
        }

        public function test_creates_a_note()
        {
            $note = $this->repo->create('Test title', '# Content');
            $this->assertInstanceOf(Note::class, $note);
            $this->assertEquals('Test title', $note->getTitle());
            $this->assertEquals('# Content', $note->getContent());

            $this->assertTrue(
                Storage::disk('local')->exists("notes/{$note->getId()}.md")
            );
        }

        public function test_gets_a_note()
        {
            $created = $this->repo->create('My note', '# Hello');

            $note = $this->repo->get($created->getId());

            $this->assertEquals($created->getId(), $note->getId());
            $this->assertEquals('My note', $note->getTitle());
            $this->assertEquals('# Hello', trim($note->getContent()));
        }

        public function test_throws_if_note_not_found_on_get()
        {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repo->get((string) Str::uuid());
        }

        public function test_updates_a_note()
        {
            $created = $this->repo->create('Old', '# Old content');
            sleep(1);
            $updated = $this->repo->update($created->getId(), 'New', '# New content');

            $this->assertEquals('New', $updated->getTitle());
            $this->assertEquals('# New content', $updated->getContent());
            $this->assertEquals($created->getCreatedAt(), $updated->getCreatedAt());
            $this->assertNotEquals($created->getUpdatedAt(), $updated->getUpdatedAt());
        }

        public function test_throws_if_note_not_found_on_update()
        {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repo->update((string) Str::uuid(), 'x', 'y');
        }

        public function test_deletes_a_note()
        {
            $note = $this->repo->create('To delete', 'content');

            $this->repo->delete($note->getId());

            $this->assertFalse(
                Storage::disk('local')->exists("notes/{$note->getId()}.md")
            );
        }

        public function test_throws_if_note_not_found_on_delete()
        {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('NOT_FOUND');

            $this->repo->delete((string) Str::uuid());
        }

        public function test_throws_if_delete_failed_on_found_note()
        {
            $diskMock = Mockery::mock(\Illuminate\Contracts\Filesystem\Filesystem::class);
            $diskMock->shouldReceive('exists')->twice()->andReturn(true);
            $diskMock->shouldReceive('delete')->once()->andReturn(false);

            Storage::shouldReceive('disk')->times(3)->andReturn($diskMock);

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('DELETE_FAILED');

            $this->repo->delete((string) Str::uuid());
        }

        public function test_lists_notes()
        {
            $firstDate = now()->subDay();
            $secondDate = now();
        
            $this->travelTo($firstDate); //freeze time
            $note1 = $this->repo->create('First', 'A');
            
            $this->travelTo($secondDate); //freeze time
            $note2 = $this->repo->create('Second', 'B');

            $list = $this->repo->list();

            $this->assertCount(2, $list);
            $this->assertEquals($list[0]->getId(), $note2->getId());
            $this->assertEquals($list[0]->getTitle(), $note2->getTitle());
            $this->assertEquals($list[0]->getCreatedAt(), $note2->getCreatedAt());
            $this->assertEquals($list[0]->getUpdatedAt(), $note2->getUpdatedAt());
            $this->assertEquals($list[1]->getId(), $note1->getId());
            $this->assertEquals($list[1]->getTitle(), $note1->getTitle());
            $this->assertEquals($list[1]->getCreatedAt(), $note1->getCreatedAt());
            $this->assertEquals($list[1]->getUpdatedAt(), $note1->getUpdatedAt());

            $this->travelBack();
        }

        public function test_orders_notes_by_updated_at_desc()
        {
            $firstDate = now()->subDay();
            $secondDate = now();

            $this->travelTo($firstDate); //freeze time
            
            $n1 = $this->repo->create('First', 'A');

            $this->travelTo($secondDate);
            $n2 = $this->repo->create('Second', 'B');

            $list = $this->repo->list();

            $this->assertEquals($n2->getId(), $list[0]->getId());

            $this->travelBack();
        }

        public function test_checks_if_title_is_used()
        {
            $note = $this->repo->create('Duplicate', 'x');

            $this->assertTrue($this->repo->isTitleUsed('Duplicate'));
            $this->assertTrue($this->repo->isTitleUsed('duplicate'));
            $this->assertFalse($this->repo->isTitleUsed('Other'));
        }

        public function test_ignores_excluded_id_when_checking_title()
        {
            $note = $this->repo->create('Same', 'x');

            $this->assertFalse(
                $this->repo->isTitleUsed('Same', $note->getId())
            );
        }

        public function test_rejects_invalid_id()
        {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('INVALID_ID');

            $this->repo->get('invalid-id');
        }

        public function test_extracts_title_from_markdown_if_missing()
        {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/$id.md",
                "# My Title\n\nContent"
            );

            $note = $this->repo->get($id);

            $this->assertEquals('My Title', $note->getTitle());
        }

        public function test_falls_back_to_default_title()
        {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/$id.md",
                "No title here"
            );

            $note = $this->repo->get($id);

            $this->assertEquals('Note ' . substr($id, 0, 8), $note->getTitle());
        }

        public function test_parses_front_matter_correctly()
        {
            $id = (string) Str::uuid();

            $content = <<<MD
                        ---
                        id: $id
                        title: "Hello"
                        created_at: "2020-01-01"
                        updated_at: "2020-01-02"
                        ---

                        Body
                        MD;

            Storage::disk('local')->put("notes/$id.md", $content);

            $note = $this->repo->get($id);

            $this->assertEquals('Hello', $note->getTitle());
            $this->assertEquals('2020-01-01', $note->getCreatedAt());
            $this->assertEquals('2020-01-02', $note->getUpdatedAt());
            $this->assertEquals('Body', trim($note->getContent()));
        }
    }

?>