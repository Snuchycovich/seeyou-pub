<?php

namespace SYP\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class SYPUserBundle extends Bundle
{
    public function getParent()
    {
        return 'FOSUserBundle';
    }
}
