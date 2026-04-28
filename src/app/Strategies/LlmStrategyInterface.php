<?php

    namespace App\Strategies;

    use App\Utilities\Context;

    interface LlmStrategyInterface {

        public function process(Context $context):string ; 
    }

?>