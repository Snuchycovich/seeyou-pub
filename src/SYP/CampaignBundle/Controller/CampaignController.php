<?php

namespace SYP\CampaignBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class CampaignController extends Controller
{
    public function indexAction()
    {
        //return new Response('Hello Youpubers');
        $content = $this
        ->get('templating')
        ->render(
            'SYPCampaignBundle:Campaign:index.html.twig',
            array(
            'nom' => 'youpuber1'
            )
        );
        return new Response($content);
    }

    public function viewAction()
    {
        $content = $this
        ->get('templating')
        ->render(
            'SYPCampaignBundle:Campaign:view.html.twig',
            array(
            'nom' => 'youpuber1'
            )
        );
        return new Response($content);
    }
}
