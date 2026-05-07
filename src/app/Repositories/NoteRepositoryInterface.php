<?php
    namespace App\Repositories;

    use App\Models\Note;

    interface NoteRepositoryInterface {
        public function list() : array;
        public function get(string $id) : Note;
        public function create(string $title, string $contentMd) : Note;
        public function update(string $id, string $title, string $contentMd) : Note;
        public function delete(string $id) : void;
        public function isTitleUsed(string $title, ?string $exludeId = null) : bool;
    }
?>