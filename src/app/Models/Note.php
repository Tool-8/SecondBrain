<?php
    namespace App\Models;

    class Note {
        public function __construct(
            private readonly string $id,
            private readonly string $title,
            private readonly string $contentMd,
            private readonly ?string $createdAt = null,
            private readonly ?string $updatedAt = null
        ) { }
        
        public function getData(): array {
            return [
                'id' => $this->id,
                'title' => $this->title,
                'content_md' => $this->contentMd,
                'created_at' => $this->createdAt,
                'updated_at' => $this->updatedAt,
            ];
        }
        
        public function getId(): string {return $this->id;}
        public function getTitle(): string {return $this->title;}
        public function getContent(): string {return $this->contentMd;}
        public function getCreatedAt(): string {return $this->createdAt;}
        public function getUpdatedAt(): string {return $this->updatedAt;}
    }