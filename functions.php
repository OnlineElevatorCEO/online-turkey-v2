<?php
add_theme_support('title-tag');
add_theme_support('woocommerce');
add_theme_support('menus');
register_nav_menus(['header-menu'=>'Header Menü']);
function ot_enqueue_scripts(){wp_enqueue_style('ot-main', get_template_directory_uri().'/assets/css/main.css');wp_enqueue_script('ot-js', get_template_directory_uri().'/assets/js/main.js',[],false,true);}add_action('wp_enqueue_scripts','ot_enqueue_scripts');
?>