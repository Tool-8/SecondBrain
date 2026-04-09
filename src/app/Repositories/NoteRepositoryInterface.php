<?php
    namespace App\Repositories;

    interface NoteRepositoryInterface {
        public function list() : array;
        public function get(string $id) : array;
        public function create(string $title, string $contentMd) : array;
        public function update(string $id, string $title, string $contentMd) : array;
        public function delete(string $id) : void;
        public function isTitleUsed(string $title, ?string $exludeId = null) : bool;
    }
?>