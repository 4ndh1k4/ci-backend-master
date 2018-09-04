<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Identitas_web extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
		$this->load->database();
        $this->load->model('Identitas_web_model');
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
			//query data
			$query = $this->db->get('identitas_web');
			  
			//cek jika tabel kosong
			if($query->num_rows() == 0){
				redirect('identitas_web/create');			 
			} 
			$this->read(1);	
			
			
		}
    }		
	
	public function get_Meta(){
		
		$rows = $this->Identitas_web_model->get_all();
		foreach ($rows as $row) {			
			$this->data['web_name'] 		= $this->form_validation->set_value('nama_web',$row->nama_web);
			$this->data['meta_description']	= $this->form_validation->set_value('meta_deskripsi',$row->meta_deskripsi);
			$this->data['meta_keywords'] 	= $this->form_validation->set_value('meta_keyword',$row->meta_keyword);
			$this->data['copyrights'] 		= $this->form_validation->set_value('copyright',$row->copyright);
			$this->data['logos'] 			= $this->form_validation->set_value('logo',$row->logo);
	    }
	}
    
    public function json() {
        header('Content-Type: application/json');
        echo $this->Identitas_web_model->json();
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
			
			$row = $this->Identitas_web_model->get_by_id($id);
			if ($row) {
				$this->data['button']		= 'Detail';
				$this->data['action']		= site_url('identitas_web/update/'.$row->id_identitas.'');
			    $this->data['id_identitas'] = array(
					'name'			=> 'id_identitas',
					'type'			=> 'hidden',
					'value'			=> $this->form_validation->set_value('id_identitas', 1),
					'class'			=> 'form-control',
				);
			    $this->data['nama_web'] = array(
					'name'			=> 'nama_web',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('nama_web', $row->nama_web),
					'class'			=> 'form-control',
					'readonly'		=> 'readonly',
				);
			    $this->data['meta_deskripsi'] = array(
					'name'			=> 'meta_deskripsi',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('meta_deskripsi', $row->meta_deskripsi),
					'class'			=> 'form-control',
					'readonly'		=> 'readonly',
					'rows' 			=> '2',
				);
			    $this->data['meta_keyword'] = array(
					'name'			=> 'meta_keyword',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('meta_keyword', $row->meta_keyword),
					'class'			=> 'form-control',
					'readonly'		=> 'readonly',
					'rows' 			=> '2',
					
				);
			    $this->data['copyright'] = array(
					'name'			=> 'copyright',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('copyright', $row->copyright),
					'class'			=> 'form-control',
					'readonly'		=> 'readonly',
				);
			    $this->data['logo'] = $this->form_validation->set_value('logo', $row->logo);
				
				$this->data['title'] = 'Ubah identitas web';
				$this->get_Meta();
				$this->data['_view'] = 'identitas_web/identitas_web_read';
				$this->_render_page('layouts/main',$this->data);
			} else {
				$this->data['message'] = 'Data Tidak Ditemukan';
				redirect(site_url('identitas_web'));
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
			
			$this->data['button'] = 'Tambah';
			$this->data['action'] = site_url('identitas_web/create_action');
		    $this->data['id_identitas'] = array(
				'name'			=> 'id_identitas',
				'type'			=> 'hidden',
				'value'			=> $this->form_validation->set_value('id_identitas',1),
				'class'			=> 'form-control',
			);
		    $this->data['nama_web'] = array(
				'name'			=> 'nama_web',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('nama_web'),
				'class'			=> 'form-control',
			);
		    $this->data['meta_deskripsi'] = array(
				'name'			=> 'meta_deskripsi',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('meta_deskripsi'),
				'class'			=> 'form-control',
				'rows' 			=> '2',
			);
		    $this->data['meta_keyword'] = array(
				'name'			=> 'meta_keyword',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('meta_keyword'),
				'class'			=> 'form-control',
				'rows' 			=> '2',
			);
		    $this->data['copyright'] = array(
				'name'			=> 'copyright',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('copyright'),
				'class'			=> 'form-control',
			);
		    $this->data['logo'] = array(
				'name'			=> 'logo',
				'type'			=> 'text',
				'value'			=> $this->form_validation->set_value('logo'),
				'class'			=> 'form-control',
			);
			$this->data['title'] = 'Identitas Web';
			$this->get_Meta();
			$this->data['_view'] = 'identitas_web/identitas_web_form';
			$this->_render_page('layouts/main',$this->data);
		}
    }
    
    public function create_action() 
    {
        $this->_rules();

        if ($this->form_validation->run() == FALSE) {
            $this->create();
        } else {
            $upload_path 				= './uploads/';
            $config['upload_path'] 		= $upload_path;
            $config['allowed_types'] 	= 'jpg|png|gif';
            $config['max_size'] 		= '0';
            $config['max_filename'] 	= '255';
            $config['encrypt_name'] 	= TRUE;
            $image_data 				= array();
			$config['overwrite']        = TRUE;
			$config['detect_mime']      = TRUE;
			$config['mod_mime_fix']     = TRUE;
			$config['remove_spaces']    = TRUE;
							
            $is_file_error 				= FALSE;            
            if (!$is_file_error) {
                $this->load->library('upload', $config);
				if (!$this->upload->do_upload('logo')) {
					$this->data['message'] =$this->upload->display_errors();
					$is_file_error = TRUE;
				} else {
					$image_data 				= $this->upload->data();
                    $config['image_library'] 	= 'gd2';
                    $config['source_image'] 	= $image_data['full_path']; 
                    $config['maintain_ratio'] 	= TRUE;
                    $config['width'] 			= 150;
                    $config['height'] 			= 100;
                    $this->load->library('image_lib', $config);
                    if (!$this->image_lib->resize()) {
                        $this->data['message'] =$this->image_lib->display_errors();
                    }					
					$data['logo'] 				= $upload_path . $image_data['file_name'];					
                }
            }
            if ($is_file_error) {
                if ($image_data) {
                    $file = $upload_path . $image_data['file_name'];
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
            }
			$data = array(
			'id_identitas'		=> $this->input->post('id_identitas',TRUE),
			'nama_web' 			=> $this->input->post('nama_web',TRUE),
			'meta_deskripsi' 	=> $this->input->post('meta_deskripsi',TRUE),
			'meta_keyword' 		=> $this->input->post('meta_keyword',TRUE),
			'copyright' 		=> $this->input->post('copyright',TRUE),
			);

            $this->Identitas_web_model->insert($data);
            $this->data['message'] = 'Data berhasil ditambahkan';
            redirect(site_url('identitas_web'));
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
			
			$row = $this->Identitas_web_model->get_by_id($id);

			if ($row) {
				$this->data['button']		= 'Ubah';
				$this->data['action']		= site_url('identitas_web/update_action');
			    $this->data['id_identitas'] = array(
					'name'			=> 'id_identitas',
					'type'			=> 'hidden',
					'value'			=> $this->form_validation->set_value('id_identitas', 1),
					'class'			=> 'form-control',
				);
			    $this->data['nama_web'] = array(
					'name'			=> 'nama_web',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('nama_web', $row->nama_web),
					'class'			=> 'form-control',
				);
			    $this->data['meta_deskripsi'] = array(
					'name'			=> 'meta_deskripsi',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('meta_deskripsi', $row->meta_deskripsi),
					'class'			=> 'form-control',
					'rows' 			=> '2',
				);
			    $this->data['meta_keyword'] = array(
					'name'			=> 'meta_keyword',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('meta_keyword', $row->meta_keyword),
					'class'			=> 'form-control',
					'rows' 			=> '2',
				);
			    $this->data['copyright'] = array(
					'name'			=> 'copyright',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('copyright', $row->copyright),
					'class'			=> 'form-control',
				);
			    $this->data['logo'] = array(
					'name'			=> 'logo',
					'type'			=> 'text',
					'value'			=> $this->form_validation->set_value('logo', $row->logo),
					'class'			=> 'form-control',
				);
				$this->data['title'] = 'Ubah identitas web';
				$this->get_Meta();
				$this->data['_view'] = 'identitas_web/identitas_web_form';
				$this->_render_page('layouts/main',$this->data);
			} else {
				$this->data['message'] = 'Data Tidak Ditemukan';
				redirect(site_url('identitas_web'));
			}
		}
    }
    
    public function update_action() 
    {
        $this->_rules();

        if ($this->form_validation->run() == FALSE) {
            $this->update($this->input->post('id_identitas', TRUE));
        } else {
			$upload_path 				= './uploads/';
            $config['upload_path'] 		= $upload_path;
            $config['allowed_types'] 	= 'jpg|png|gif';
            $config['max_size'] 		= '0';
            $config['max_filename'] 	= '255';
            $config['encrypt_name'] 	= TRUE;
            $image_data 				= array();
			$config['overwrite']        = TRUE;
			$config['detect_mime']      = TRUE;
			$config['mod_mime_fix']     = TRUE;
			$config['remove_spaces']    = TRUE;
							
            $is_file_error 				= FALSE;            
            if (!$is_file_error) {
                $this->load->library('upload', $config);
				if (!$this->upload->do_upload('logo')) {
					$this->data['message'] =$this->upload->display_errors();
					$is_file_error = TRUE;
				} else {
					$image_data 				= $this->upload->data();
                    $config['image_library'] 	= 'gd2';
                    $config['source_image'] 	= $image_data['full_path']; 
                    $config['maintain_ratio'] 	= TRUE;
                    $config['width'] 			= 150;
                    $config['height'] 			= 100;
                    $this->load->library('image_lib', $config);
                    if (!$this->image_lib->resize()) {
                        $this->data['message'] =$this->image_lib->display_errors();
                    }					
					$data['logo'] 				= $upload_path . $image_data['file_name'];					
                }
            }
            if ($is_file_error) {
                if ($image_data) {
                    $file = $upload_path . $image_data['file_name'];
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
            }
			
			$data = array(
			'id_identitas'		=> $this->input->post('id_identitas',TRUE),
			'nama_web' 			=> $this->input->post('nama_web',TRUE),
			'meta_deskripsi' 	=> $this->input->post('meta_deskripsi',TRUE),
			'meta_keyword' 		=> $this->input->post('meta_keyword',TRUE),
			'copyright' 		=> $this->input->post('copyright',TRUE),
			);		
			$this->Identitas_web_model->update($this->input->post('id_identitas', TRUE), $data);	
			$this->data['message'] = 'Data berhasil dirubah';		
			redirect(site_url('identitas_web'));
        }
    }
	    
    public function delete($id) 
    {
        $row = $this->Identitas_web_model->get_by_id($id);

        if ($row) {
            $this->Identitas_web_model->delete($id);
            $this->data['message'] = 'Hapus data berhasil';
            redirect(site_url('identitas_web'));
        } else {
            $this->data['message'] = 'Data tidak ditemukan';
            redirect(site_url('identitas_web'));
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
	$this->form_validation->set_rules('nama_web', 'nama web', 'trim|required');
	$this->form_validation->set_rules('meta_deskripsi', 'meta deskripsi', 'trim|required');
	$this->form_validation->set_rules('meta_keyword', 'meta keyword', 'trim|required');
	$this->form_validation->set_rules('copyright', 'copyright', 'trim|required');
	

	$this->form_validation->set_rules('id_identitas', 'id_identitas', 'trim');
	$this->form_validation->set_error_delimiters('<span class="text-danger">', '</span>');
    }

}

/* End of file Identitas_web.php */
/* Location: ./application/controllers/Identitas_web.php */
