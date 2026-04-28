<?php
    namespace App\Services;

    use App\Repositories\NoteRepositoryInterface;
    use RuntimeException;
    use App\Models\Note;

    class NoteService {
        public function __construct(
            private readonly NoteRepositoryInterface $repository
        ) {}

        public function list() : array {
            return $this->repository->list();
        }

        public function get(string $id) : Note {
            return $this->repository->get($id);
        }

        public function create(string $title, string $contentMd) : Note {
            if ($this->repository->isTitleUsed($title)) throw new RuntimeException("TITLE_IN_USE");
            return $this->repository->create($title, $contentMd);
        }

        public function update(string $id, string $title, string $contentMd) : Note {
            if ($this->repository->isTitleUsed($title, $id)) throw new RuntimeException("TITLE_IN_USE");
            return $this->repository->update($id, $title, $contentMd);
        }

        public function delete(string $id) : void {
            $this->repository->delete($id);
        }
    }
?>