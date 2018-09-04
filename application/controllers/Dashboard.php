<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('Identitas_web_model');
		$this->load->library(array('ion_auth', 'form_validation'));
		$this->load->helper(array('url', 'language'));

		$this->form_validation->set_error_delimiters($this->config->item('error_start_delimiter', 'ion_auth'), $this->config->item('error_end_delimiter', 'ion_auth'));

		$this->lang->load('auth');
	}

	/**
	 * Redirect if needed, otherwise display the user list
	 */
	public function index()
	{

		if (!$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}		
		else
		{
			// set the flash data error message if there is one
			$this->data['message'] = (validation_errors()) ? validation_errors() : $this->session->flashdata('message');

			//list the users
			$this->data['usr'] = $this->ion_auth->user()->row();
			
			$this->data['title'] = 'Beranda';
			$this->get_Meta();
			
			$this->data['_view']='';
			$this->_render_page('layouts/main', $this->data);
		}
	}
	
	public function get_Meta(){
		
		$rows = $this->Identitas_web_model->get_all();
		foreach ($rows as $row) {			
			$this->data['web_name'] 		= $this->form_validation->set_value('nama_web',$row->nama_web);
			$this->data['meta_description']	= $this->form_validation->set_value('meta_deskripsi',$row->meta_deskripsi);
			$this->data['meta_keywords'] 	= $this->form_validation->set_value('meta_keyword',$row->meta_keyword);
			$this->data['copyrights'] 		= $this->form_validation->set_value('copyright',$row->copyright);
			$this->data['logos'] 		= $this->form_validation->set_value('logo',$row->logo);
	    }
	}

	public function _render_page($view, $data = NULL, $returnhtml = FALSE)
	{

		$this->viewdata = (empty($data)) ? $this->data : $data;

		$view_html = $this->load->view($view, $this->viewdata, $returnhtml);

		if ($returnhtml)
		{
			return $view_html;
		}
	}

}
