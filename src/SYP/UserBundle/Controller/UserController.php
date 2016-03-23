<?php

namespace SYP\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class UserController extends Controller
{
    public function indexAction()
    {
        return $this->render('SYPUserBundle:User:index.html.twig');
    }
}
