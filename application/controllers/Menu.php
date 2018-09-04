<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Menu extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
		$this->load->database();
        $this->load->model(array('Menu_model','Identitas_web_model'));
        $this->load->library(array('ion_auth','form_validation'));
		$this->load->helper(array('url', 'html'));        
		$this->load->library('datatables');
    }

    public function index()
    {
        if (!$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			$this->data['usr'] = $this->ion_auth->user()->row();
						
			$this->data['title'] = 'menu';
			$this->get_Meta();
			
			$this->data['_view']='menu/menu_list';
			$this->_render_page('layouts/main',$this->data);
		}
    } 
    
    public function json() {
        header('Content-Type: application/json');
        echo $this->Menu_model->json();
    }

    public function read($id) 
    {
        if (!$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			$this->data['usr'] = $this->ion_auth->user()->row();
			
			$row = $this->Menu_model->get_by_id($id);
			if ($row) {
				$this->data['id'] = $this->form_validation->set_value('id',$row->id);
				$this->data['parent_menu'] = $this->form_validation->set_value('parent_menu',$row->parent_menu);
				$this->data['nama_menu'] = $this->form_validation->set_value('nama_menu',$row->nama_menu);
				$this->data['controller_link'] = $this->form_validation->set_value('controller_link',$row->controller_link);
				$this->data['icon'] = $this->form_validation->set_value('icon',$row->icon);
				$this->data['slug'] = $this->form_validation->set_value('slug',$row->slug);
				$this->data['urut_menu'] = $this->form_validation->set_value('urut_menu',$row->urut_menu);
				$this->data['menu_grup_user'] = $this->form_validation->set_value('menu_grup_user',$row->menu_grup_user);
				$this->data['is_active'] = $this->form_validation->set_value('is_active',$row->is_active);
	    
				$this->data['title'] = 'menu';
				$this->get_Meta();
				$this->data['_view'] = 'menu/menu_read';
				$this->_render_page('layouts/main',$this->data);
			} else {
				$this->data['message'] = 'Data tidak ditemukan';
				redirect(site_url('menu'));
			}
		}
    }

    public function create() 
    {
        if (!$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			$this->data['usr'] = $this->ion_auth->user()->row();			
			$this->data['user'] = $this->ion_auth->user()->row();
			$this->data['users'] = $this->ion_auth->users()->result();
			foreach ($this->data['users'] as $k => $user)
			{
				$this->data['users'][$k]->groups = $this->ion_auth->get_users_groups($user->id)->result();
			}
			$this->data['get_parent'] = $this->Menu_model->get_all();
			
			$this->data['button'] = 'Tambah';
			$this->data['action'] = site_url('menu/create_action');
		    $this->data['id'] = array(
				'name'			=> 'id',
				'type'			=> 'hidden',
				'value'			=> $this->form_validation->set_value('id'),
				'class'			=> 'form-control',
			);
		    $this->data['parent_menu'] = array(
				'name'			=> 'parent_menu',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('parent_menu'),
				'class'			=> 'form-control select2',
			);
		    $this->data['nama_menu'] = array(
				'name'			=> 'nama_menu',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('nama_menu'),
				'class'			=> 'form-control',
			);
		    $this->data['controller_link'] = array(
				'name'			=> 'controller_link',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('controller_link'),
				'class'			=> 'form-control',
			);
		    $this->data['icon'] = array(
				'name'			=> 'icon',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('icon'),
				'class'			=> 'form-control select2',
			);
		    $this->data['slug'] = array(
				'name'			=> 'slug',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('slug'),
				'class'			=> 'form-control',
			);
		    $this->data['urut_menu'] = array(
				'name'			=> 'urut_menu',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('urut_menu'),
				'class'			=> 'form-control',
			);
		    $this->data['menu_grup_user'] = array(
				'name'			=> 'menu_grup_user',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('menu_grup_user'),
				'class'			=> 'form-control select2',
			);
		    $this->data['is_active'] = array(
				'name'			=> 'is_active',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('is_active'),
				'class'			=> 'form-control select2',
			);
	
			$this->data['title'] = 'menu';
			$this->get_Meta();
			$this->data['_view'] = 'menu/menu_form';
			$this->_render_page('layouts/main',$this->data);
		}
    }
    
    public function create_action() 
    {
        $this->_rules();

        if ($this->form_validation->run() == FALSE) {
            $this->create();
        } else {
            $data = array(
			'parent_menu' 			=> $this->input->post('parent_menu',TRUE),
			'nama_menu' 			=> $this->input->post('nama_menu',TRUE),
			'controller_link' 		=> $this->input->post('controller_link',TRUE),
			'icon' 					=> $this->input->post('icon',TRUE),
			'slug' 					=> $this->input->post('slug',TRUE),
			'urut_menu' 			=> $this->input->post('urut_menu',TRUE),
			'menu_grup_user' 			=> $this->input->post('menu_grup_user',TRUE),
			'is_active' 			=> $this->input->post('is_active',TRUE),
			);

            $this->Menu_model->insert($data);
            $this->data['message'] = 'Data berhasil ditambahkan';
            redirect(site_url('menu'));
        }
    }
    
    public function update($id) 
    {
        if (!$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			$this->data['usr'] = $this->ion_auth->user()->row();
			$this->data['user'] = $this->ion_auth->user()->row();
			$this->data['users'] = $this->ion_auth->users()->result();
			foreach ($this->data['users'] as $k => $user)
			{
				$this->data['users'][$k]->groups = $this->ion_auth->get_users_groups($user->id)->result();
			}
			
			
			$this->data['get_parent'] = $this->Menu_model->get_all();
			
			$row = $this->Menu_model->get_by_id($id);

			if ($row) {
				$this->data['button']		= 'Ubah';
				$this->data['action']		= site_url('menu/update_action');
			    $this->data['id'] = array(
					'name'			=> 'id',
					'type'			=> 'hidden',
					'value'			=> $this->form_validation->set_value('id', $row->id),
					'class'			=> 'form-control',
				);
			    $this->data['parent_menu'] = array(
					'name'			=> 'parent_menu',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('parent_menu', $row->parent_menu),
					'class'			=> 'form-control select2',
				);
			    $this->data['nama_menu'] = array(
					'name'			=> 'nama_menu',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('nama_menu', $row->nama_menu),
					'class'			=> 'form-control',
				);
			    $this->data['controller_link'] = array(
					'name'			=> 'controller_link',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('controller_link', $row->controller_link),
					'class'			=> 'form-control',
				);
			    $this->data['icon'] = array(
					'name'			=> 'icon',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('icon', $row->icon),
					'class'			=> 'form-control select2',
				);
			    $this->data['slug'] = array(
					'name'			=> 'slug',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('slug', $row->slug),
					'class'			=> 'form-control',
				);
			    $this->data['urut_menu'] = array(
					'name'			=> 'urut_menu',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('urut_menu', $row->urut_menu),
					'class'			=> 'form-control',
				);
			    $this->data['menu_grup_user'] = array(
					'name'			=> 'menu_grup_user',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('menu_grup_user', $row->menu_grup_user),
					'class'			=> 'form-control select2',
				);
			    $this->data['is_active'] = array(
					'name'			=> 'is_active',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('is_active', $row->is_active),
					'class'			=> 'form-control select2',
				);
	   
				$this->data['title'] = 'menu';
				$this->get_Meta();
				$this->data['_view'] = 'menu/menu_form';
				$this->_render_page('layouts/main',$this->data);
			} else {
				$this->data['message'] = 'Data Tidak Ditemukan';
				redirect(site_url('menu'));
			}
		}
    }
    
    public function update_action() 
    {
        $this->_rules();

        if ($this->form_validation->run() == FALSE) {
            $this->update($this->input->post('id', TRUE));
        } else {
            $data = array(
			'parent_menu' 					=> $this->input->post('parent_menu',TRUE),
			'nama_menu' 					=> $this->input->post('nama_menu',TRUE),
			'controller_link' 					=> $this->input->post('controller_link',TRUE),
			'icon' 					=> $this->input->post('icon',TRUE),
			'slug' 					=> $this->input->post('slug',TRUE),
			'urut_menu' 					=> $this->input->post('urut_menu',TRUE),
			'menu_grup_user' 					=> $this->input->post('menu_grup_user',TRUE),
			'is_active' 					=> $this->input->post('is_active',TRUE),
	    );

            $this->Menu_model->update($this->input->post('id', TRUE), $data);
            $this->data['message'] = 'Data berhasil di ubah';
            redirect(site_url('menu'));
        }
    }
    
    public function delete($id) 
    {
        $row = $this->Menu_model->get_by_id($id);

        if ($row) {
            $this->Menu_model->delete($id);
            $this->data['message'] = 'Hapus data berhasil';
            redirect(site_url('menu'));
        } else {
            $this->data['message'] = 'Data tidak ditemukan';
            redirect(site_url('menu'));
        }
    }
	
	public function get_Meta(){
		
		$rows = $this->Identitas_web_model->get_all();
		foreach ($rows as $row) {			
			$this->data['web_name'] 		= $this->form_validation->set_value('nama_web',$row->nama_web);
			$this->data['meta_description']= $this->form_validation->set_value('meta_deskripsi',$row->meta_deskripsi);
			$this->data['meta_keywords'] 	= $this->form_validation->set_value('meta_keyword',$row->meta_keyword);
			$this->data['copyrights'] 		= $this->form_validation->set_value('copyright',$row->copyright);
			$this->data['logos'] 		= $this->form_validation->set_value('logo',$row->logo);
	    }
	}
	
	public function _render_page($view, $data = NULL, $returnhtml = FALSE)//I think this makes more sense
	{

		$this->viewdata = (empty($data)) ? $this->data : $data;

		$view_html = $this->load->view($view, $this->viewdata, $returnhtml);

		// This will return html on 3rd argument being true
		if ($returnhtml)
		{
			return $view_html;
		}
	}
	
    public function _rules() 
    {
	$this->form_validation->set_rules('parent_menu', 'parent menu', 'trim');
	$this->form_validation->set_rules('nama_menu', 'nama menu', 'trim|required');
	$this->form_validation->set_rules('controller_link', 'controller link', 'trim|required');
	$this->form_validation->set_rules('icon', 'icon', 'trim|required');
	$this->form_validation->set_rules('slug', 'slug', 'trim|required');
	$this->form_validation->set_rules('urut_menu', 'urut menu', 'trim|required');
	$this->form_validation->set_rules('menu_grup_user', 'menu grup user', 'trim|required');
	$this->form_validation->set_rules('is_active', 'is active', 'trim|required');

	$this->form_validation->set_rules('id', 'id', 'trim');
	$this->form_validation->set_error_delimiters('<span class="text-danger">', '</span>');
    }

}

/* End of file Menu.php */
/* Location: ./application/controllers/Menu.php */
