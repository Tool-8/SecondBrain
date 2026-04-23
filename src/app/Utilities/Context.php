<?php

    namespace App\Utilities;

    class Context {
        public function __construct(
            private readonly string $text,
            private readonly ?array $options = null
        ) {}

        public function getText(): string {return $this->text;}
        public function getOptions(): array {return $this->options;}
        
        }

?>