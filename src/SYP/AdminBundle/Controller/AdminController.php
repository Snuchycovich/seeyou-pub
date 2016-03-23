<?php

namespace SYP\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class AdminController extends Controller
{
    public function indexAction()
    {
        return $this->render('SYPAdminBundle:Admin:index.html.twig');
    }
    
    public function viewCampaignAction()
    {
        return $this->render('SYPAdminBundle:Admin:viewCampaign.html.twig');
    }

    public function profilesAction()
    {
        return $this->render('SYPAdminBundle:Admin:profile.html.twig');
    }

    public function searchProfileAction()
    {
        return $this->render('SYPAdminBundle:Admin:searchProfile.html.twig');
    }

    public function uploadAction()
    {
        return $this->render('SYPAdminBundle:Admin:upload.html.twig');
    }
}
