<?php

$string = "<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class " . $c . " extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
		\$this->load->database();
        \$this->load->model(array('$m','Identitas_web_model'));
        \$this->load->library(array('ion_auth','form_validation'));
		\$this->load->helper(array('url', 'html'));";

if ($jenis_tabel <> 'reguler_table') {
    $string .= "        \n\t\t		\$this->load->library('datatables');";
}
        
$string .= "
    }";

if ($jenis_tabel == 'reguler_table') {
    
$string .= "\n\n    public function index()
    {
        \$q = urldecode(\$this->input->get('q', TRUE));
        \$start = intval(\$this->input->get('start'));
        
        if (\$q <> '') {
            \$config['base_url'] = base_url() . '$c_url/index.html?q=' . urlencode(\$q);
            \$config['first_url'] = base_url() . '$c_url/index.html?q=' . urlencode(\$q);
        } else {
            \$config['base_url'] = base_url() . '$c_url/index.html';
            \$config['first_url'] = base_url() . '$c_url/index.html';
        }

        \$config['per_page'] = 10;
        \$config['page_query_string'] = TRUE;
        \$config['total_rows'] = \$this->" . $m . "->total_rows(\$q);
        \$$c_url = \$this->" . $m . "->get_limit_data(\$config['per_page'], \$start, \$q);

        \$this->load->library('pagination');
        \$this->pagination->initialize(\$config);
            
        \$this->data['" . $c_url . "_data'] = \$$c_url;
        \$this->data['q'] = \$q;
        \$this->data['pagination'] = \$this->pagination->create_links();
        \$this->data['total_rows'] = \$config['total_rows'];
        \$this->data['start'] = \$start;
		
		\$this->data['user'] = \$this->ion_auth->user()->row();
		
		\$this->data['title'] = '$c_url';
		\$this->get_Meta();
			
        \$this->data['_view'] = '$c_url/$v_list';
        \$this->_render_page('layouts/main', \$this->data);
    }";

} else {
    
$string .="\n\n    public function index()
    {
        if (!\$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!\$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			\$this->data['user'] = \$this->ion_auth->user()->row();
			
			\$this->data['title'] = '$c_url';
			\$this->get_Meta();
			
			\$this->data['_view']='$c_url/$v_list';
			\$this->_render_page('layouts/main',\$this->data);
		}
    } 
    
    public function json() {
        header('Content-Type: application/json');
        echo \$this->" . $m . "->json();
    }";

}
    
$string .= "\n\n    public function read(\$id) 
    {
        if (!\$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!\$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			\$this->data['user'] = \$this->ion_auth->user()->row();
			
			\$row = \$this->" . $m . "->get_by_id(\$id);
			if (\$row) {";
			foreach ($all as $row) {
				$string .= "\n\t\t\t	\$this->data['" . $row['column_name'] . "'] = \$this->form_validation->set_value('" . $row['column_name'] . "',\$row->" . $row['column_name'] . ");";
			}
	$string .= "\n\t    
				\$this->data['title'] = '$c_url';
				\$this->get_Meta();
				\$this->data['_view'] = '$c_url/$v_read';
				\$this->_render_page('layouts/main',\$this->data);
			} else {
				\$this->data['message'] = 'Data tidak ditemukan';
				redirect(site_url('$c_url'));
			}
		}
    }

    public function create() 
    {
        if (!\$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!\$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			\$this->data['user'] = \$this->ion_auth->user()->row();
			
			\$this->data['button'] = 'Tambah';
			\$this->data['action'] = site_url('$c_url/create_action');";
	foreach ($all as $row) {
		$string .= "\n\t\t    \$this->data['" . $row['column_name'] . "'] = array(
				'name'			=> '" . $row['column_name'] . "',
				'type'			=> 'text',
				'value'			=> \$this->form_validation->set_value('" . $row['column_name'] . "'),
				'class'			=> 'form-control',
			);";
	}
	$string .= "\n\t
			\$this->data['title'] = '$c_url';
			\$this->get_Meta();
			\$this->data['_view'] = '$c_url/$v_form';
			\$this->_render_page('layouts/main',\$this->data);
		}
    }
    
    public function create_action() 
    {
        \$this->_rules();

        if (\$this->form_validation->run() == FALSE) {
            \$this->create();
        } else {
            \$data = array(";
foreach ($non_pk as $row) {
		$string .= "\n\t\t'" . $row['column_name'] . "' 			=> \$this->input->post('" . $row['column_name'] . "',TRUE),";
}
$string .= "\n\t    );

            \$this->".$m."->insert(\$data);
            \$this->data['message'] = 'Data berhasil ditambahkan';
            redirect(site_url('$c_url'));
        }
    }
    
    public function update(\$id) 
    {
        if (!\$this->ion_auth->logged_in())
		{
			// redirect them to the login page
			redirect('auth/login', 'refresh');
		}
		else if (!\$this->ion_auth->is_admin()) // remove this elseif if you want to enable this for non-admins
		{
			// redirect them to the home page because they must be an administrator to view this
			return show_error('Anda tidak punya akses di halaman ini');
		}
		else
		{
			\$this->data['user'] = \$this->ion_auth->user()->row();
			
			\$row = \$this->".$m."->get_by_id(\$id);

			if (\$row) {
				\$this->data['button']		= 'Ubah';
				\$this->data['action']		= site_url('$c_url/update_action');";
				
	foreach ($all as $row) {
			$string .= "\n\t\t\t    \$this->data['" . $row['column_name'] . "'] = array(
					'name'			=> '" . $row['column_name'] . "',
					'type'			=> 'text',
					'value'			=> \$this->form_validation->set_value('" . $row['column_name'] . "', \$row->". $row['column_name']."),
					'class'			=> 'form-control',
				);";
		
	}
	$string .= "\n\t   
				\$this->data['title'] = '$c_url';
				\$this->get_Meta();
				\$this->data['_view'] = '$c_url/$v_form';
				\$this->_render_page('layouts/main',\$this->data);
			} else {
				\$this->data['message'] = 'Data Tidak Ditemukan';
				redirect(site_url('$c_url'));
			}
		}
    }
    
    public function update_action() 
    {
        \$this->_rules();

        if (\$this->form_validation->run() == FALSE) {
            \$this->update(\$this->input->post('$pk', TRUE));
        } else {
            \$data = array(";
	foreach ($non_pk as $row) {
				$string .= "\n\t\t\t'" . $row['column_name'] . "' 					=> \$this->input->post('" . $row['column_name'] . "',TRUE),";
	}    
	$string .= "\n\t    );

            \$this->".$m."->update(\$this->input->post('$pk', TRUE), \$data);
            \$this->data['message'] = 'Data berhasil di ubah';
            redirect(site_url('$c_url'));
        }
    }
    
    public function delete(\$id) 
    {
        \$row = \$this->".$m."->get_by_id(\$id);

        if (\$row) {
            \$this->".$m."->delete(\$id);
            \$this->data['message'] = 'Hapus data berhasil';
            redirect(site_url('$c_url'));
        } else {
            \$this->data['message'] = 'Data tidak ditemukan';
            redirect(site_url('$c_url'));
        }
    }
	
	public function get_Meta(){
		
		\$rows = \$this->Identitas_web_model->get_all();
		foreach (\$rows as \$row) {			
			\$this->data['name_web'] 		= \$this->form_validation->set_value('nama_web',\$row->nama_web);
			\$this->data['meta_description']= \$this->form_validation->set_value('meta_deskripsi',\$row->meta_deskripsi);
			\$this->data['meta_keywords'] 	= \$this->form_validation->set_value('meta_keyword',\$row->meta_keyword);
			\$this->data['copyrights'] 		= \$this->form_validation->set_value('copyright',\$row->copyright);
			\$this->data['logos'] 		= \$this->form_validation->set_value('logo',\$row->logo);
	    }
	}
	
	public function _render_page(\$view, \$data = NULL, \$returnhtml = FALSE)//I think this makes more sense
	{

		\$this->viewdata = (empty(\$data)) ? \$this->data : \$data;

		\$view_html = \$this->load->view(\$view, \$this->viewdata, \$returnhtml);

		// This will return html on 3rd argument being true
		if (\$returnhtml)
		{
			return \$view_html;
		}
	}
	
    public function _rules() 
    {";
foreach ($non_pk as $row) {
    $int = $row3['data_type'] == 'int' || $row['data_type'] == 'double' || $row['data_type'] == 'decimal' ? '|numeric' : '';
    $string .= "\n\t\$this->form_validation->set_rules('".$row['column_name']."', '".  strtolower(label($row['column_name']))."', 'trim|required$int');";
}    
$string .= "\n\n\t\$this->form_validation->set_rules('$pk', '$pk', 'trim');";
$string .= "\n\t\$this->form_validation->set_error_delimiters('<span class=\"text-danger\">', '</span>');
    }";

if ($export_excel == '1') {
    $string .= "\n\n    public function excel()
    {
        \$this->load->helper('exportexcel');
        \$namaFile = \"$table_name.xls\";
        \$judul = \"$table_name\";
        \$tablehead = 0;
        \$tablebody = 1;
        \$nourut = 1;
        //penulisan header
        header(\"Pragma: public\");
        header(\"Expires: 0\");
        header(\"Cache-Control: must-revalidate, post-check=0,pre-check=0\");
        header(\"Content-Type: application/force-download\");
        header(\"Content-Type: application/octet-stream\");
        header(\"Content-Type: application/download\");
        header(\"Content-Disposition: attachment;filename=\" . \$namaFile . \"\");
        header(\"Content-Transfer-Encoding: binary \");

        xlsBOF();

        \$kolomhead = 0;
        xlsWriteLabel(\$tablehead, \$kolomhead++, \"No\");";
foreach ($non_pk as $row) {
        $column_name = label($row['column_name']);
        $string .= "\n\txlsWriteLabel(\$tablehead, \$kolomhead++, \"$column_name\");";
}
$string .= "\n\n\tforeach (\$this->" . $m . "->get_all() as \$data) {
            \$kolombody = 0;

            //ubah xlsWriteLabel menjadi xlsWriteNumber untuk kolom numeric
            xlsWriteNumber(\$tablebody, \$kolombody++, \$nourut);";
foreach ($non_pk as $row) {
        $column_name = $row['column_name'];
        $xlsWrite = $row['data_type'] == 'int' || $row['data_type'] == 'double' || $row['data_type'] == 'decimal' ? 'xlsWriteNumber' : 'xlsWriteLabel';
        $string .= "\n\t    " . $xlsWrite . "(\$tablebody, \$kolombody++, \$data->$column_name);";
}
$string .= "\n\n\t    \$tablebody++;
            \$nourut++;
        }

        xlsEOF();
        exit();
    }";
}

if ($export_word == '1') {
    $string .= "\n\n    public function word()
    {
        header(\"Content-type: application/vnd.ms-word\");
        header(\"Content-Disposition: attachment;Filename=$table_name.doc\");

        \$data = array(
            '" . $table_name . "_data' => \$this->" . $m . "->get_all(),
            'start' => 0
        );
        
        \$this->load->view('" . $c_url ."/". $v_doc . "',\$data);
    }";
}

if ($export_pdf == '1') {
    $string .= "\n\n    function pdf()
    {
        \$data = array(
            '" . $table_name . "_data' => \$this->" . $m . "->get_all(),
            'start' => 0
        );
        
        ini_set('memory_limit', '32M');
        \$html = \$this->load->view('" . $c_url ."/". $v_pdf . "', \$data, true);
        \$this->load->library('pdf');
        \$pdf = \$this->pdf->load();
        \$pdf->WriteHTML(\$html);
        \$pdf->Output('" . $table_name . ".pdf', 'D'); 
    }";
}

$string .= "\n\n}\n\n/* End of file $c_file */
/* Location: ./application/controllers/$c_file */
";




$hasil_controller = createFile($string, $target . "controllers/" . $c_file);

?>