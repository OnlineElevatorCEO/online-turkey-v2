<!DOCTYPE html>
<html><?php language_attributes(); ?>
<head><meta charset='<?php bloginfo('charset'); ?>'><?php wp_head(); ?></head>
<body><header class='ot-header'><div class='logo'><a href='<?php echo site_url(); ?>'><img src='<?php echo get_template_directory_uri(); ?>/assets/images/logo.png' height='60'></a></div><?php wp_nav_menu(['theme_location'=>'header-menu']); ?></header>