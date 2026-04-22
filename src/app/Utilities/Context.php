<?php

    namespace App\Utilities;

    class Context {
        public function __construct(
            private readonly string $text,
            private readonly array $options,
            private readonly string $action
        ) {}

        public function getText(): string {return $this->text;}
        public function getOptions(): array {return $this->options;}
        public function getAction(): string {return $this->action;}
        
        }

?>