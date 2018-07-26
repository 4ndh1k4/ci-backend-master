<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Identitas_web_model extends CI_Model
{

    public $table = 'identitas_web';
    public $id = 'id_identitas';
    public $order = 'DESC';

    function __construct()
    {
        parent::__construct();
    }
    
    // get all
    function get_all()
    {
        $this->db->order_by($this->id, $this->order);
        return $this->db->get($this->table)->result();
    }
			
    // get data by id
    function get_by_id($id)
    {
        $this->db->where($this->id, $id);
        return $this->db->get($this->table)->row();
    }
        
    // insert data
    function insert($data)
    {
        $this->db->insert($this->table, $data);
    }

    // update data
    function update($id, $data)
    {
        $this->db->where($this->id, $id);
        $this->db->update($this->table, $data);
    }
    

}

/* End of file Identitas_web_model.php */
/* Location: ./application/models/Identitas_web_model.php */
