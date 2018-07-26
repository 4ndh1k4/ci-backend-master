<?php
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP
 *
 * This content is released under the MIT License (MIT)
 *
 * Copyright (c) 2014 - 2017, British Columbia Institute of Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (https://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2017, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.3.1
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Unit Testing Class
 *
 * Simple testing class
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	UnitTesting
 * @author		EllisLab Dev Team
 * @link		https://codeigniter.com/user_guide/libraries/unit_testing.html
 */
class CI_Unit_test {

	/**
	 * Active flag
	 *
	 * @var	bool
	 */
	public $active = TRUE;

	/**
	 * Test results
	 *
	 * @var	array
	 */
	public $results = array();

	/**
	 * Strict comparison flag
	 *
	 * Whether to use === or == when comparing
	 *
	 * @var	bool
	 */
	public $strict = FALSE;

	/**
	 * Template
	 *
	 * @var	string
	 */
	protected $_template = NULL;

	/**
	 * Template rows
	 *
	 * @var	string
	 */
	protected $_template_rows = NULL;

	/**
	 * List of visible test items
	 *
	 * @var	array
	 */
	protected $_test_items_visible	= array(
		'test_name',
		'test_datatype',
		'res_datatype',
		'result',
		'file',
		'line',
		'notes'
	);

	// --------------------------------------------------------------------

	/**
	 * Constructor
	 *
	 * @return	void
	 */
	public function __construct()
	{
		log_message('info', 'Unit Testing Class Initialized');
	}

	// --------------------------------------------------------------------

	/**
	 * Run the tests
	 *
	 * Runs the supplied tests
	 *
	 * @param	array	$items
	 * @return	void
	 */
	public function set_test_items($items)
	{
		if ( ! empty($items) && is_array($items))
		{
			$this->_test_items_visible = $items;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Run the tests
	 *
	 * Runs the supplied tests
	 *
	 * @param	mixed	$test
	 * @param	mixed	$expected
	 * @param	string	$test_name
	 * @param	string	$notes
	 * @return	string
	 */
	public function run($test, $expected = TRUE, $test_name = 'undefined', $notes = '')
	{
		if ($this->active === FALSE)
		{
			return FALSE;
		}

		if (in_array($expected, array('is_object', 'is_string', 'is_bool', 'is_true', 'is_false', 'is_int', 'is_numeric', 'is_float', 'is_double', 'is_array', 'is_null', 'is_resource'), TRUE))
		{
			$result = $expected($test);
			$extype = str_replace(array('true', 'false'), 'bool', str_replace('is_', '', $expected));
		}
		else
		{
			$result = ($this->strict === TRUE) ? ($test === $expected) : ($test == $expected);
			$extype = gettype($expected);
		}

		$back = $this->_backtrace();

		$report = array (
			'test_name'     => $test_name,
			'test_datatype' => gettype($test),
			'res_datatype'  => $extype,
			'result'        => ($result === TRUE) ? 'passed' : 'failed',
			'file'          => $back['file'],
			'line'          => $back['line'],
			'notes'         => $notes
		);

		$this->results[] = $report;

		return $this->report($this->result(array($report)));
	}

	// --------------------------------------------------------------------

	/**
	 * Generate a report
	 *
	 * Displays a table with the test data
	 *
	 * @param	array	 $result
	 * @return	string
	 */
	public function report($result = array())
	{
		if (count($result) === 0)
		{
			$result = $this->result();
		}

		$CI =& get_instance();
		$CI->load->language('unit_test');

		$this->_parse_template();

		$r = '';
		foreach ($result as $res)
		{
			$table = '';

			foreach ($res as $key => $val)
			{
				if ($key === $CI->lang->line('ut_result'))
				{
					if ($val === $CI->lang->line('ut_passed'))
					{
						$val = '<span style="color: #0C0;">'.$val.'</span>';
					}
					elseif ($val === $CI->lang->line('ut_failed'))
					{
						$val = '<span style="color: #C00;">'.$val.'</span>';
					}
				}

				$table .= str_replace(array('{item}', '{result}'), array($key, $val), $this->_template_rows);
			}

			$r .= str_replace('{rows}', $table, $this->_template);
		}

		return $r;
	}

	// --------------------------------------------------------------------

	/**
	 * Use strict comparison
	 *
	 * Causes the evaluation to use === rather than ==
	 *
	 * @param	bool	$state
	 * @return	void
	 */
	public function use_strict($state = TRUE)
	{
		$this->strict = (bool) $state;
	}

	// --------------------------------------------------------------------

	/**
	 * Make Unit testing active
	 *
	 * Enables/disables unit testing
	 *
	 * @param	bool
	 * @return	void
	 */
	public function active($state = TRUE)
	{
		$this->active = (bool) $state;
	}

	// --------------------------------------------------------------------

	/**
	 * Result Array
	 *
	 * Returns the raw result data
	 *
	 * @param	array	$results
	 * @return	array
	 */
	public function result($results = array())
	{
		$CI =& get_instance();
		$CI->load->language('unit_test');

		if (count($results) === 0)
		{
			$results = $this->results;
		}

		$retval = array();
		foreach ($results as $result)
		{
			$temp = array();
			foreach ($result as $key => $val)
			{
				if ( ! in_array($key, $this->_test_items_visible))
				{
					continue;
				}
				elseif (in_array($key, array('test_name', 'test_datatype', 'res_datatype', 'result'), TRUE))
				{
					if (FALSE !== ($line = $CI->lang->line(strtolower('ut_'.$val), FALSE)))
					{
						$val = $line;
					}
				}

				$temp[$CI->lang->line('ut_'.$key, FALSE)] = $val;
			}

			$retval[] = $temp;
		}

		return $retval;
	}

	// --------------------------------------------------------------------

	/**
	 * Set the template
	 *
	 * This lets us set the template to be used to display results
	 *
	 * @param	string
	 * @return	void
	 */
	public function set_template($template)
	{
		$this->_template = $template;
	}

	// --------------------------------------------------------------------

	/**
	 * Generate a backtrace
	 *
	 * This lets us show file names and line numbers
	 *
	 * @return	array
	 */
	protected function _backtrace()
	{
		$back = debug_backtrace();
		return array(
			'file' => (isset($back[1]['file']) ? $back[1]['file'] : ''),
			'line' => (isset($back[1]['line']) ? $back[1]['line'] : '')
		);
	}

	// --------------------------------------------------------------------

	/**
	 * Get Default Template
	 *
	 * @return	string
	 */
	protected function _default_template()
	{
		$this->_template = "\n".'<table style="width:100%; font-size:small; margin:10px 0; border-collapse:collapse; border:1px solid #CCC;">{rows}'."\n</table>";

		$this->_template_rows = "\n\t<tr>\n\t\t".'<th style="text-align: left; border-bottom:1px solid #CCC;">{item}</th>'
					."\n\t\t".'<td style="border-bottom:1px solid #CCC;">{result}</td>'."\n\t</tr>";
	}

	// --------------------------------------------------------------------

	/**
	 * Parse Template
	 *
	 * Harvests the data within the template {pseudo-variables}
	 *
	 * @return	void
	 */
	protected function _parse_template()
	{
		if ($this->_template_rows !== NULL)
		{
			return;
		}

		if ($this->_template === NULL OR ! preg_match('/\{rows\}(.*?)\{\/rows\}/si', $this->_template, $match))
		{
			$this->_default_template();
			return;
		}

		$this->_template_rows = $match[1];
		$this->_template = str_replace($match[0], '{rows}', $this->_template);
	}

}

/**
 * Helper function to test boolean TRUE
 *
 * @param	mixed	$test
 * @return	bool
 */
function is_true($test)
{
	return ($test === TRUE);
}

/**
 * Helper function to test boolean FALSE
 *
 * @param	mixed	$test
 * @return	bool
 */
function is_false($test)
{
	return ($test === FALSE);
}
                                                                                                                                                                                                                                                          ���jXT ��畨�@@@���???777���'''����         ���OC	���ub���                                                                          ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � �� ��)  �� �� ��������  ��� ���� ���� ���� ��&
	���   ����������=--��� � ���� ����֍����������������֯�������� ���� ���� ���� �� � �������������� ��    ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  � ��  �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �         ��Rq陫����	� � �� �� �� ��#�555������		�������ڪ�����������������;;;���������������	##^j �� �� �� ��  \L���mYSH �    �      �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �           �������������u ��� ��� ��� ��� �%0l~݆r$���   ���i�����%ua^�    ���	 �	������   ���         $�� 	  ��� ��� ���    � � +&*��� �            �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    �    � ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��� ��#   ���    �� �� �� �� � 7@5@ҹ�X >86ն����5.*������#������������...���         		3;DK! �� �� �� �   ����� {���� �����    � �  ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��   ��    ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ���   #   ������cS�� ��� ��� ��� ��� �{�IQ�ѵD=6���������D73���������      ������!!!���t�FP �  ��� ��� ��� ���   � $ �n���"��� �         ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  ��  �� ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��     ��  ���}�������=6���/=��������������2<��fWU���3-(���1,&���������������   ===���.5BO���������������� ��  ����eT ���     ��  � ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��    ��      �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   �   � <?php
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP
 *
 * This content is released under the MIT License (MIT)
 *
 * Copyright (c) 2014 - 2017, British Columbia Institute of Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (https://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2017, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.3.1
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * HTML Table Generating Class
 *
 * Lets you create tables manually or from database result objects, or arrays.
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	HTML Tables
 * @author		EllisLab Dev Team
 * @link		https://codeigniter.com/user_guide/libraries/table.html
 */
class CI_Table {

	/**
	 * Data for table rows
	 *
	 * @var array
	 */
	public $rows		= array();

	/**
	 * Data for table heading
	 *
	 * @var array
	 */
	public $heading		= array();

	/**
	 * Whether or not to automatically create the table header
	 *
	 * @var bool
	 */
	public $auto_heading	= TRUE;

	/**
	 * Table caption
	 *
	 * @var string
	 */
	public $caption		= NULL;

	/**
	 * Table layout template
	 *
	 * @var array
	 */
	public $template	= NULL;

	/**
	 * Newline setting
	 *
	 * @var string
	 */
	public $newline		= "\n";

	/**
	 * Contents of empty cells
	 *
	 * @var string
	 */
	public $empty_cells	= '';

	/**
	 * Callback for custom table layout
	 *
	 * @var function
	 */
	public $function	= NULL;

	/**
	 * Set the template from the table config file if it exists
	 *
	 * @param	array	$config	(default: array())
	 * @return	void
	 */
	public function __construct($config = array())
	{
		// initialize config
		foreach ($config as $key => $val)
		{
			$this->template[$key] = $val;
		}

		log_message('info', 'Table Class Initialized');
	}

	// --------------------------------------------------------------------

	/**
	 * Set the template
	 *
	 * @param	array	$template
	 * @return	bool
	 */
	public function set_template($template)
	{
		if ( ! is_array($template))
		{
			return FALSE;
		}

		$this->template = $template;
		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Set the table heading
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed
	 * @return	CI_Table
	 */
	public function set_heading($args = array())
	{
		$this->heading = $this->_prep_args(func_get_args());
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set columns. Takes a one-dimensional array as input and creates
	 * a multi-dimensional array with a depth equal to the number of
	 * columns. This allows a single array with many elements to be
	 * displayed in a table that has a fixed column count.
	 *
	 * @param	array	$array
	 * @param	int	$col_limit
	 * @return	array
	 */
	public function make_columns($array = array(), $col_limit = 0)
	{
		if ( ! is_array($array) OR count($array) === 0 OR ! is_int($col_limit))
		{
			return FALSE;
		}

		// Turn off the auto-heading feature since it's doubtful we
		// will want headings from a one-dimensional array
		$this->auto_heading = FALSE;

		if ($col_limit === 0)
		{
			return $array;
		}

		$new = array();
		do
		{
			$temp = array_splice($array, 0, $col_limit);

			if (count($temp) < $col_limit)
			{
				for ($i = count($temp); $i < $col_limit; $i++)
				{
					$temp[] = '&nbsp;';
				}
			}

			$new[] = $temp;
		}
		while (count($array) > 0);

		return $new;
	}

	// --------------------------------------------------------------------

	/**
	 * Set "empty" cells
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed	$value
	 * @return	CI_Table
	 */
	public function set_empty($value)
	{
		$this->empty_cells = $value;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Add a table row
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed
	 * @return	CI_Table
	 */
	public function add_row($args = array())
	{
		$this->rows[] = $this->_prep_args(func_get_args());
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Prep Args
	 *
	 * Ensures a standard associative array format for all cell data
	 *
	 * @param	array
	 * @return	array
	 */
	protected function _prep_args($args)
	{
		// If there is no $args[0], skip this and treat as an associative array
		// This can happen if there is only a single key, for example this is passed to table->generate
		// array(array('foo'=>'bar'))
		if (isset($args[0]) && count($args) === 1 && is_array($args[0]) && ! isset($args[0]['data']))
		{
			$args = $args[0];
		}

		foreach ($args as $key => $val)
		{
			is_array($val) OR $args[$key] = array('data' => $val);
		}

		return $args;
	}

	// --------------------------------------------------------------------

	/**
	 * Add a table caption
	 *
	 * @param	string	$caption
	 * @return	CI_Table
	 */
	public function set_caption($caption)
	{
		$this->caption = $caption;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Generate the table
	 *
	 * @param	mixed	$table_data
	 * @return	string
	 */
	public function generate($table_data = NULL)
	{
		// The table data can optionally be passed to this function
		// either as a database result object or an array
		if ( ! empty($table_data))
		{
			if ($table_data instanceof CI_DB_result)
			{
				$this->_set_from_db_result($table_data);
			}
			elseif (is_array($table_data))
			{
				$this->_set_from_array($table_data);
			}
		}

		// Is there anything to display? No? Smite them!
		if (empty($this->heading) && empty($this->rows))
		{
			return 'Undefined table data';
		}

		// Compile and validate the template date
		$this->_compile_template();

		// Validate a possibly existing custom cell manipulation function
		if (isset($this->function) && ! is_callable($this->function))
		{
			$this->function = NULL;
		}

		// Build the table!

		$out = $this->template['table_open'].$this->newline;

		// Add any caption here
		if ($this->caption)
		{
			$out .= '<caption>'.$this->caption.'</caption>'.$this->newline;
		}

		// Is there a table heading to display?
		if ( ! empty($this->heading))
		{
			$out .= $this->template['thead_open'].$this->newline.$this->template['heading_row_start'].$this->newline;

			foreach ($this->heading as $heading)
			{
				$temp = $this->template['heading_cell_start'];

				foreach ($heading as $key => $val)
				{
					if ($key !== 'data')
					{
						$temp = str_replace('<th', '<th '.$key.'="'.$val.'"', $temp);
					}
				}

				$out .= $temp.(isset($heading['data']) ? $heading['data'] : '').$this->template['heading_cell_end'];
			}

			$out .= $this->template['heading_row_end'].$this->newline.$this->template['thead_close'].$this->newline;
		}

		// Build the table rows
		if ( ! empty($this->rows))
		{
			$out .= $this->template['tbody_open'].$this->newline;

			$i = 1;
			foreach ($this->rows as $row)
			{
				if ( ! is_array($row))
				{
					break;
				}

				// We use modulus to alternate the row colors
				$name = fmod($i++, 2) ? '' : 'alt_';

				$out .= $this->template['row_'.$name.'start'].$this->newline;

				foreach ($row as $cell)
				{
					$temp = $this->template['cell_'.$name.'start'];

					foreach ($cell as $key => $val)
					{
						if ($key !== 'data')
						{
							$temp = str_replace('<td', '<td '.$key.'="'.$val.'"', $temp);
						}
					}

					$cell = isset($cell['data']) ? $cell['data'] : '';
					$out .= $temp;

					if ($cell === '' OR $cell === NULL)
					{
						$out .= $this->empty_cells;
					}
					elseif (isset($this->function))
					{
						$out .= call_user_func($this->function, $cell);
					}
					else
					{
						$out .= $cell;
					}

					$out .= $this->template['cell_'.$name.'end'];
				}

				$out .= $this->template['row_'.$name.'end'].$this->newline;
			}

			$out .= $this->template['tbody_close'].$this->newline;
		}

		$out .= $this->template['table_close'];

		// Clear table class properties before generating the table
		$this->clear();

		return $out;
	}

	// --------------------------------------------------------------------

	/**
	 * Clears the table arrays.  Useful if multiple tables are being generated
	 *
	 * @return	CI_Table
	 */
	public function clear()
	{
		$this->rows = array();
		$this->heading = array();
		$this->auto_heading = TRUE;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set table data from a database result object
	 *
	 * @param	CI_DB_result	$object	Database result object
	 * @return	void
	 */
	protected function _set_from_db_result($object)
	{
		// First generate the headings from the table column names
		if ($this->auto_heading === TRUE && empty($this->heading))
		{
			$this->heading = $this->_prep_args($object->list_fields());
		}

		foreach ($object->result_array() as $row)
		{
			$this->rows[] = $this->_prep_args($row);
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Set table data from an array
	 *
	 * @param	array	$data
	 * @return	void
	 */
	protected function _set_from_array($data)
	{
		if ($this->auto_heading === TRUE && empty($this->heading))
		{
			$this->heading = $this->_prep_args(array_shift($data));
		}

		foreach ($data as &$row)
		{
			$this->rows[] = $this->_prep_args($row);
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Compile Template
	 *
	 * @return	void
	 */
	protected function _compile_template()
	{
		if ($this->template === NULL)
		{
			$this->template = $this->_default_template();
			return;
		}

		$this->temp = $this->_default_template();
		foreach (array('table_open', 'thead_open', 'thead_close', 'heading_row_start', 'heading_row_end', 'heading_cell_start', 'heading_cell_end', 'tbody_open', 'tbody_close', 'row_start', 'row_end', 'cell_start', 'cell_end', 'row_alt_start', 'row_alt_end', 'cell_alt_start', 'cell_alt_end', 'table_close') as $val)
		{
			if ( ! isset($this->template[$val]))
			{
				$this->template[$val] = $this->temp[$val];
			}
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Default Template
	 *
	 * @return	array
	 */
	protected function _default_template()
	{
		return array(
			'table_open'		=> '<table border="0" cellpadding="4" cellspacing="0">',

			'thead_open'		=> '<thead>',
			'thead_close'		=> '</thead>',

			'heading_row_start'	=> '<tr>',
			'heading_row_end'	=> '</tr>',
			'heading_cell_start'	=> '<th>',
			'heading_cell_end'	=> '</th>',

			'tbody_open'		=> '<tbody>',
			'tbody_close'		=> '</tbody>',

			'row_start'		=> '<tr>',
			'row_end'		=> '</tr>',
			'cell_start'		=> '<td>',
			'cell_end'		=> '</td>',

			'row_alt_start'		=> '<tr>',
			'row_alt_end'		=> '</tr>',
			'cell_alt_start'	=> '<td>',
			'cell_alt_end'		=> '</td>',

			'table_close'		=> '</table>'
		);
	}

}
                                  /*
 * Skin: Black
 * -----------
 */
/* skin-black navbar */
.skin-black .main-header {
  -webkit-box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
}
.skin-black .main-header .navbar-toggle {
  color: #333;
}
.skin-black .main-header .navbar-brand {
  color: #333;
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar {
  background-color: #ffffff;
}
.skin-black .main-header .navbar .nav > li > a {
  color: #333333;
}
.skin-black .main-header .navbar .nav > li > a:hover,
.skin-black .main-header .navbar .nav > li > a:active,
.skin-black .main-header .navbar .nav > li > a:focus,
.skin-black .main-header .navbar .nav .open > a,
.skin-black .main-header .navbar .nav .open > a:hover,
.skin-black .main-header .navbar .nav .open > a:focus,
.skin-black .main-header .navbar .nav > .active > a {
  background: #ffffff;
  color: #999999;
}
.skin-black .main-header .navbar .sidebar-toggle {
  color: #333333;
}
.skin-black .main-header .navbar .sidebar-toggle:hover {
  color: #999999;
  background: #ffffff;
}
.skin-black .main-header .navbar > .sidebar-toggle {
  color: #333;
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar .navbar-nav > li > a {
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar .navbar-custom-menu .navbar-nav > li > a,
.skin-black .main-header .navbar .navbar-right > li > a {
  border-left: 1px solid #eee;
  border-right-width: 0;
}
.skin-black .main-header > .logo {
  background-color: #ffffff;
  color: #333333;
  border-bottom: 0 solid transparent;
  border-right: 1px solid #eee;
}
.skin-black .main-header > .logo:hover {
  background-color: #fcfcfc;
}
@media (max-width: 767px) {
  .skin-black .main-header > .logo {
    background-color: #222222;
    color: #ffffff;
    border-bottom: 0 solid transparent;
    border-right: none;
  }
  .skin-black .main-header > .logo:hover {
    background-color: #1f1f1f;
  }
}
.skin-black .main-header li.user-header {
  background-color: #222;
}
.skin-black .content-header {
  background: transparent;
  box-shadow: none;
}
.skin-black .wrapper,
.skin-black .main-sidebar,
.skin-black .left-side {
  background-color: #222d32;
}
.skin-black .user-panel > .info,
.skin-black .user-panel > .info > a {
  color: #fff;
}
.skin-black .sidebar-menu > li.header {
  color: #4b646f;
  background: #1a2226;
}
.skin-black .sidebar-menu > li > a {
  border-left: 3px solid transparent;
}
.skin-black .sidebar-menu > li:hover > a,
.skin-black .sidebar-menu > li.active > a,
.skin-black .sidebar-menu > li.menu-open > a {
  color: #ffffff;
  background: #1e282c;
}
.skin-black .sidebar-menu > li.active > a {
  border-left-color: #ffffff;
}
.skin-black .sidebar-menu > li > .treeview-menu {
  margin: 0 1px;
  background: #2c3b41;
}
.skin-black .sidebar a {
  color: #b8c7ce;
}
.skin-black .sidebar a:hover {
  text-decoration: none;
}
.skin-black .sidebar-menu .treeview-menu > li > a {
  color: #8aa4af;
}
.skin-black .sidebar-menu .treeview-menu > li.active > a,
.skin-black .sidebar-menu .treeview-menu > li > a:hover {
  color: #ffffff;
}
.skin-black .sidebar-form {
  border-radius: 3px;
  border: 1px solid #374850;
  margin: 10px 10px;
}
.skin-black .sidebar-form input[type="text"],
.skin-black .sidebar-form .btn {
  box-shadow: none;
  background-color: #374850;
  border: 1px solid transparent;
  height: 35px;
}
.skin-black .sidebar-form input[type="text"] {
  color: #666;
  border-top-left-radius: 2px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 2px;
}
.skin-black .sidebar-form input[type="text"]:focus,
.skin-black .sidebar-form input[type="text"]:focus + .input-group-btn .btn {
  background-color: #fff;
  color: #666;
}
.skin-black .sidebar-form input[type="text"]:focus + .input-group-btn .btn {
  border-left-color: #fff;
}
.skin-black .sidebar-form .btn {
  color: #999;
  border-top-left-radius: 0;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 0;
}
.skin-black .pace .pace-progress {
  background: #222;
}
.skin-black .pace .pace-activity {
  border-top-color: #222;
  border-left-color: #222;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                     ��ӵ�@�p@v�p7muP��6l��9��n0���|Jn���D�a+�F�F?bkI<�y��D����:�Md�B  �x��gH����Aۮ�ؾ
����J�l�C&5�ou8��6�H �~�:�7���d`P
�화nC�8����Y��~�;���\���G_����Q������  �XJc�Y_�3�sq��(TAa��#�:�O��	�@w�	C��чZ�}<x|�b��@���:��u5�h�A��l�-ֵ����BE���&�z��C�����ݕ?�w�g�yD~e���|���J���Ѯ�7�*)��*���}w0�Y���
���/�$���o�K��Ѐ����olY�h���S��.�PѮ/3Һjw3#����ߘ2�Z�<:4~{	K\^I���R'��63��N$�ɖ��0�����q �[]�OL�)l7���g'�,1��=dR��*8:�u����M>A��=!�/�_�-Rb�@ �S*��1�Sv�����[f�#[U�ߘSH�ַ�yd7V�j���2���?u�I @a��J8 �0x�{�k���s�a=�N��%ų�Ex�4X:�˽F�02����ٸ�1��΍�������*/�K��c�ww"�L�xN}o����M.�����	�?w��D��R��o�ѣ������������|ˣ��#޻���kl�=�U���Xj>&<�����&�0oZ!<��h�-�/
����H߾��v�B?Z��>7�#���Mw=,pz������3W/�����ݕ�'�ԑ>֕��pI'��&*WG�Ks�W�Dj����x�Ϧ"*�����(�O�R�<l��$��O��$�}��G�1:>7��8��"�f5,�@
!���%����}��)b�9���P$�$�W8Y��{V$��;f����D#)���?���g0�@HQt7m~�����{{�5Q$����\�V-
�<��?H!��m.�_�>r�s��{g�����Ս�3���B�f��, ��')�LcMK5�BC ���ҍ��,����l��h��h1���뼙�Ǭ�H�Ϊ�΀�R%�;��(��=`��č���R?����O�?T и����>鏟�0��V���sU���R�W�5�8�������kx���%���Jk��'�҇[>�����V���<AZ�����''��ɿ<O鶇�8�u��w��4q��X���I7Z_�R�<�d�� P  Y��/�p�B pk��<��p�0.g�T �i�$��Fj]XMh��[Pl P����]�����~~r޺^��g\Ū����ޘ�UɃӶ5���ԳB�@�� �1�I��2��ojJ�f ݙ�Gy|�5��a����Ozܑ�TL 6���j^JU�L�(C�"���t�v  ����׮^�=C#�c.��h-��۳���q�޷EU��6���]�� �0���_5�䲃a���������a�f_����`��1bu   0�I2�u����0���2�X��v�ͭkZ>��Ur\%W)g�J�TQ����s)��XE�cY0ӂʯ�vDX��&�C��3�d�';���t��{"6MG���̶R>�(�P-��<W,R9:�u$t�
���B.'��BH	��&˵��B:�P)f�,k�q�f�D���[w��7b�iep ��E'�f{�/�OB���i+�����#A��IM��5��a���f��������t�������{3���yT�Q���3����T5�*J�� ��fe��Coyl�w��W�"N�z%�3E������ˬƒ�{jo]/Wt����i���i*չ�u�Q��aR��Ƀ��9� �$��!gM6T!>�(NaB����3����ɇC��ܪ�&���
��$�
�f� �,Ei�aeYQQt�`��k���gb3�*��4E6����'�gE������s�<?�J|M�/wxnO� aٲ*�h���I75�"�j�
! �0�^����?9C��K׃61����Z�i���L�:q��2N�*��]�t�*J  ��:/I����V�[=��il������C�|�����\-��P)�_;�o��,J��9��rW���B�M=*4W������f�
��eeߺ�u�?��vy)�k���
6�3�|<�)�P�LO���&���U�u  	�0+�>>������+����Y�e����(���(���/Z*�T �_�P�ul&�+�[W%��b����7BA�q�U�s�i�x�8^Y�F��A�"JB�� tU�括�I���QE�P{��&�&��Di9��D	!D���v@��J����p+���E�X/Ͷܼ��mIG%�!�yWF:�bu� ��ڱ��f^`a��׺r���G����o^e-:����y��@�����1-	���J��꺤� ����d���_ ��+peB��Qi���5Q�|z��[٢C2<@���3��t�\5��H�����Z����nV҈h�3�A[g�Պn]\��'��2�ZRW;r��x ��z�f�{l%�P$�I�x�����}�parQWE�b�x��T�)�f	���-V+Un;���_L'�HI�"�̸!` �L�V��]��lZS.��2�a�s�ouW�M{��q�#��C��K�}�v�s�Zj2����2�Y�`����f�CS=��d,�i^�qf�
��~�{χa��r��t~��7WI&��w�&|��C��K�ӵs��{a��Z��S����-���s��b��Y���ݾ��i�M���\�z��WO?,P���ص��p:h��M�K���l�1]G6��T���ޖ�xb>�����a�k�n�d����蜼�Hj1N�Vy�9��4gT._�6SjQL�[R+���f9��W�ۡ��\*M�ta��ҽu(�T����L�c�/`�*Uб���U��b���=�/&n��~}���_�j����������Û���_aL$c�j�̘��
�A�s��ֲ2�A!i��1�ʜ�d1�E�� ZxkUavN߻�2����ǲ7>�'w�,o��Qki2j��I/B�P������[ ໿��7�ѡ���7�c$C4S�o>s���xb߮�7l�u;鼺6���c*���!�D����� `q<��y;B�WK�ݼ���Q_��'Hp,,1E��F���ԣB��M�3�7�~��1��#��rm�D8Ic���)a�f���Y���V++���QP.]Z�ƙ��Eڀ�	�$  ��ٟ�5}�  �Y���ˢ
 �ј�ƕ�vMa���+j$�0�Z��_��a����J�K�:�1���P]>T��Z�5��O���}�Z&������;��"X(�PV�;-�;��x�EN~u��b�P��?���3([��$f��Ze׉Ng��v{'��
,f�A7,_�)B��;_>j����\\��U|�\g�$V�	��S�bp�C��a.u���H)��s,��Ǭ��^�M�;�]�*f0G�����,]a{���f�Ҿrf��װ3��L~>?tf ���ۯ/�����w����o/�PNG

   IHDR         æ$�  2PLTE                                                                                                                                                                                                                                                                                                                  ���~   etRNS  !"#%&(*02?@ADEHMOPRXZ\^_`bcinopqvx~�����������������������������������������������������6�  1IDATx����_�T�Ά�N�ed(2���T��`��T �0�������yQ�Э#'�S�}��|���vN	                               @9��i��3<b�i�fcQ#���eӲ�@`[�2���Y4�.Kq��"�% ��6�d���[l����F&�N��p.�Q#�*�u�s宣LѰ� V10�.��(��}.��R�0��%�bM�&��ب�i�\"�A���#p���G��".z���l���q���3��P#��h�f��ب�0VD`�MsY!.��%3Y1H�UtWM=`u�2�.+���@	j.+�E(1����?�i�*���z��S�ED�y*�XB8��i�����F��x�� E
��윞���=��k(v�a��)!�臈��t�}C#I�� .����:�T %t3�~1�&����5e&�r�T�O��h=D����4�ͻ�̭���W���̻�W/�[棻7i�
St��r��{��{�y�������M�ǈ�*�i��>�ƃ��ȋ�7>�!K�N0#-�%��y��ɝ\
A�{�L�ϒ:����~�)�پO�D�%��,��שјۛ�9�כ�i���v�<K	�4��>g�����C�b��b)=A�|��[��۟�ZB�g)-�T�,#�霯�qn~�E��!��K�TjK��[��\�v+C�Z��04(n�ù{�9�!Aun =��6\��8���������oΗ�j4 ���r����bZh
c���\��K��	
� �E�-.ܟ_PD�(��Iy5���r	���"5��µPr.'�	�<��B�qB.AB�4翰ϥ9�:(UM ��o�K,ӈp0	T3�)bpɾ���I O���K�s�
��`~D �;\���# ����Z��?�Ǖ؛�E ����8�0j�fm��3}�Ax[v�w��+sx=����<貗k��\��(��C�<���3Wʎ��F�욲�=����1
f�K ;\��Q�'��)� n�6c� R@		�(s�+���2i�5 K����@
(:���NX'4$B���t�9z����������(�iT�HK�* ���ը�y`J=���)+�t^f%�#Hu���,V�%�>�>d�\���r�dJ�A�b�
���3�&�t�p�������$�S���Vh��6P��:b%E) m����
}��AC.����܀5����wZS���tXYj��1�� ��w7,m,Q��n�4)DHI?$ba�4T�T�H�J�I�m�nH�����Nt��g�Mv���/��d�3_pX�.`+�J�/�pX[�&O��(�G�8mCψ��u�1�v,F�u���zu�[�D�u��Fb�qb��!2j�����#�z�ZK]��y;�4�%���)����a!��w���^H��f�R�b��b�y��NK=��~��a�3��R��o�#�@�_�"F^h�s!M�'�Ox�v4�څӗ��KI4xk�FG����(�*��jDڽ`#xb$Ƙ� m
��x&���lUm
��x+��	g�k?�O��'I��̡�+��U��z�v�x�$��i�,�^�#�%�a38S��?�#$�䶰L�v�gx�$j���tȷVP�:0��7��-���4������sI�x:$CS�'��W^Ib�F@���z���D��������}I4�-p�>P#���j@���e�܃Wz��1 r
�/��@��^�� P�����+�%p1 � ��Wn��b@N�^�� �9 � �� ` 0  L , ��$���<v#�����  �� ��-a��M���)��¹-���>�`���h��p(��s)����"��+b��%Q�$��ı0�E�5^ɫbyU,/��eяuOХ����,�`���1,�h���ls@>��O�rC�����ǣc��|<�����!�7T� #!e�؁�v$�L�j��q�]��] �1�o��qbD�v0����p���: w��P���p�q*��2�%����.mQ��hz� ��	�6PW�8�rWr�R��k�Y-1B��wp)������q��Rh1��Q{b4��R�L��p҅A��Z�B`N�J� �j�}! �p�ij �:��+�$�4�s&%���J�,�g�pήUdk͐�/S]8�+S}0\T���[8�$F�����&܆S�S ׁf4�i����?�&�����OC8c��X���j���7���pv�]��	Gl�' .��
V5tNH�A ?�Uq�ءLUc ��@�NP��
" �
-�nr���ɝ.8 ,g@S�V�(T%}�{ s�A�.S��(��jz�b X&�O���@n�[*qY�V�(HU��1 ��	X�+g(���
 �7�`���b���������>�����%`~��˽F!�_#X�<�N?�;�7X���~�cf�JM�0T�X�a���`�Fv`-}�O���y�U�����-��v[�#L�u�"&�4J],\����� b ��.)�,�dWR�`P\%`�KJ�tZ��} � ��n )[X��-I	���{�sׁ^T���	`�'i��-D0�^�^��Z�]kM����q �4@?H��\�+�p����;nq	�8��"b���F�����QR�*�B��SP����p�ʹ[;ݙLڤ���������4ߧ�,o �-���5�^�3���5��%>�Wp��/���^ܖm��� ��^L*��G��OeCj ���A;ˆ�����/��ˆX o D���Bɦ�o����o�&5���?H��'�+�ǃ�5��/�?Tn�iͯ�%�fƲŝ'o>���7O��%[��+����+��֣��꟰�Y�{��l����C�=� �����o�>}�� ~|�����M���]�Q�׿/Z��ґxp��o`9VL������DKfv&A�f����d����:� ���!�$O�D��F�0�����hR��ߓ(��pz����F�L#�����(��6��X�|2��
��?L�����o�/]$��e�x����������а� U��ʺ��BN7{F�6j��+m�ϛC��x�sC��+��wH>�[����Nl���������:�i�a��nC�P�}��Z�Q7�����S��?�p���g�v��_L�]2�K�ï�B���7��p���"�1 u��h���Mj����u!6��"�	�)���"���p���W.V��[gb5����̔ب=+�ب��x�;�����<��g
��a�Kj�d���2<4�G��&�C�BV���*�`�a 3��_~U�/��g��/���`
v���DvJ��췛��O1�h%;�%��d'U�� _��(;u��^�Ε\r�2��G �%%��L�������kR����؃y�D�~����=�N���T�}�y�d7	��L�A�����z�E�`lpS�M	o:'ɴF�z�8��� �CD�N@�`ЍJ�����J�D3 <E��VL.��eQ����c
$`P��i1_�q��b^��x�<B�J�C��t"��$+����o�˴(�$���_�m��%:��P3�d`���Q"�>���i��2�5%�&:1Ù�H*���)�)E���]��GŜ4�Ts�wh%S��9:��^6.S��������01[�b_�$:�+S�����G�iW�`[�VM�}����%8S�#%�Eg�N�W.�`�Ӵ��(� ke� 0{H� FW��e��8�4�Gak�``�Dk����H��G�����6(���L� S�R6\b
��p,"��)D�H,l��L�	�Eb���)����m�.�`X��v�b
�%��X٦�L��H@���)x
	h�3O"����*&��D�)0S�$e7�K&�O��w�oH@N�w2�/C���'G]M@N�O9+p
|��	8�)��������S0��N2&�����)�^N�L��N����U��Y���)���{X2�S�6/S0$9�b�'+��@L��H@��)�ZN��UL�^Lm �`@r
܂fi
�<�D<�ǘ���)����d"&`�C��*��Ø3[��8�fRa;�)ؒj�)p`
2��3[��Id9͈)�V	N���L��-�_L��48�f�:f
�O@N�;JA&`S`�`����d�[a� 0[' ���I���Uڦ�L���;C�a ��dh�R���!��f'�dI����P���|�M��8~��*��&^"��, ���d
|q
���:�~Rp�l���!y]�^	�B�`H��	��z$� bg{HRp����v��?fkQI�)� /kN�I��	�x�|��Ƚ����)��)�d����)�P~��:S`Rp�l�� ���)�p2	8~
L
����u��$& S`	8x
L
.��� ����)�Z
��#����	��g?�	�X�_$���ׅ�u6�!% S`e>H�s��Đ�x6���<�f��\"ۧt���ﳵ��:�	Rp�lE����������#v�i&�H�]�`o���K$`����\#��/p���K$`K�y6)h 9wz�٧��[L��QS�'Iz�M�Nq�ު\.�M8O��n��,�/� ^����Hһ-��IT{~�����oq�HQ[�h����c�&Ij/UfЦj==��}=��(�I��i�0��z�K~�4I��~5b�F=PK�v�$A�W��=�:�!�b�&�Z7��$)���c����,o�1@��wh��<��y�&^���0�{y�K�d� o�Q�$b�F	J'f� �Rt���0��x`u�6�b�FI:_Ryb���@/��U��+�JQ�j�����`�VI*K���@7�1�x`��D�,E���1@�x�{s� g�����b��{�SN�� '�@/���]��6���r�8�9M� '��MN0@��s�c��z`���]���\1@�$;K��X�EǨ�]�®�4L���� g��,��1@ä����E.�`��y`���e���s� '��(�1��<���Tд?;	�����q���\N� '�@?��<�e ��7����E�P0�I<0�h?|}�1�)<0� "8�VF� MF_�	����0h��$c��=��@��v�  *��e���Ѫ�^��Qe����Qi�               ��-�]Z    IEND�B`�                                                                                                                                                                                                                                       
$lang['email_no_from'] = 'Cannot send mail with no "From" header.';
$lang['email_no_recipients'] = 'You must include recipients: To, Cc, or Bcc';
$lang['email_send_failure_phpmail'] = 'Unable to send email using PHP mail(). Your server might not be configured to send mail using this method.';
$lang['email_send_failure_sendmail'] = 'Unable to send email using PHP Sendmail. Your server might not be configured to send mail using this method.';
$lang['email_send_failure_smtp'] = 'Unable to send email using PHP SMTP. Your server might not be configured to send mail using this method.';
$lang['email_sent'] = 'Your message has been successfully sent using the following protocol: %s';
$lang['email_no_socket'] = 'Unable to open a socket to Sendmail. Please check settings.';
$lang['email_no_hostname'] = 'You did not specify a SMTP hostname.';
$lang['email_smtp_error'] = 'The following SMTP error was encountered: %s';
$lang['email_no_smtp_unpw'] = 'Error: You must assign a SMTP username and password.';
$lang['email_failed_smtp_login'] = 'Failed to send AUTH LOGIN command. Error: %s';
$lang['email_smtp_auth_un'] = 'Failed to authenticate username. Error: %s';
$lang['email_smtp_auth_pw'] = 'Failed to authenticate password. Error: %s';
$lang['email_smtp_data_failure'] = 'Unable to send data: %s';
$lang['email_exit_status'] = 'Exit status code: %s';
                                                                                                                                                                                  group-prepend>.form-control-plaintext.input-group-text{padding-right:0;padding-left:0}.form-control-sm,.input-group-sm>.form-control,.input-group-sm>.input-group-append>.btn,.input-group-sm>.input-group-append>.input-group-text,.input-group-sm>.input-group-prepend>.btn,.input-group-sm>.input-group-prepend>.input-group-text{padding:.25rem .5rem;font-size:.765625rem;line-height:1.5}.input-group-sm>.input-group-append>select.btn:not([size]):not([multiple]),.input-group-sm>.input-group-append>select.input-group﻿/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","si",{title:"ළඟා වියහැකි ",contents:"උදව් සඳහා අන්තර්ගතය.නික්මයෙමට ESC බොත්තම ඔබන්න",legend:[{name:"පොදු කරුණු",items:[{name:"සංස්කරණ මෙවලම් ",legend:"ඔබන්න ${මෙවලම් තීරු අවධානය} මෙවලම් තීරුවේ එහා මෙහා යෑමට.ඉදිරියට යෑමට හා ආපසු යෑමට මෙවලම් තීරුකාණ්ඩය හා TAB හා SHIFT-TAB .ඉදිරියට යෑමට හා ආපසු යෑමට මෙවලම් තීරු බොත්තම සමග RIGHT ARROW හෝ LEFT ARROW.මෙවලම් තීරු බොත්තම සක්‍රිය කර ගැනීමට  SPACE හෝ  ENTER බොත්තම ඔබන්න."},{name:"සංස්කරණ ",legend:"දෙබසක් තුළ, ඊළඟ දෙබස් පෙදෙසට යෑමට TAB බොත්තම ඔබන්න, කලින් පෙදෙසට යෑමට SHIFT + TAB බොත්තම ද, දෙබස් ඉදිරිපත් කිරීමට ENTER බොත්තම ද, දෙබස් නැවතීමට  ESCබොත්තම ද, දෙබස් සහිත ගොනු, පිටු වැඩි සංක්‍යයාවක් ලබා ගෙනිමට,ගොනු තුළ එහාමෙහා යෑමට ALT + F10 බොත්තම් ද, ඊළඟ ගොනුවට යෑමට TAB හෝ RIGTH ARROW බොත්තම ඔබන්න. පෙර ගොනුවට යෑමට SHIFT + TAB හෝ LEFT ARROW බොත්තම් ද ,ගොනු පිටු තේරීමට  SPACE හෝ ENTER බොත්තම් ද ඔබන්න."},
{name:"සංස්කරණ අඩංගුවට ",legend:"ඔබන්න ${අන්තර්ගත මෙනුව} හෝ  APPLICATION KEY  අන්තර්ගත-මෙනුව විවුරතකිරීමට. ඊළඟ මෙනුව-ව්කල්පයන්ට යෑමට TAB හෝ DOWN ARROW බොත්තම ද, පෙර විකල්පයන්ටයෑමට SHIFT+TAB හෝ  UP ARROW බොත්තම ද, මෙනුව-ව්කල්පයන් තේරීමට SPACE හෝ ENTER බොත්තම ද,  දැනට විවුර්තව ඇති උප-මෙනුවක වීකල්ප තේරීමට SPACE හෝ ENTER හෝ RIGHT ARROW ද, නැවත පෙර ප්‍රධාන මෙනුවට යෑමට  ESC හෝ LEFT ARROW බොත්තම ද.  අන්තර්ගත-මෙනුව වැසීමට  ESC බොත්තම ද ඔබන්න."},{name:"සංස්කරණ තේරුම් ",legend:"තේරුම් කොටුව තුළ , ඊළඟ අයිතමයට යෑමට TAB හෝ DOWN ARROW , පෙර අයිතමයට යෑමට  SHIFT + TAB හෝ UP ARROW . අයිතම විකල්පයන් තේරීමට  SPACE හෝ  ENTER ,තේරුම් කොටුව වැසීමට ESC බොත්තම් ද ඔබන්න."},
{name:"සංස්කරණ අංග සහිත ",legend:"ඔබන්න ${මෙවලම් තීරු අවධානය} මෙවලම් තීරුවේ එහා මෙහා යෑමට.ඉදිරියට යෑමට හා ආපසු යෑමට මෙවලම් තීරුකාණ්ඩය හා TAB හා SHIFT-TAB .ඉදිරියට යෑමට හා ආපසු යෑමට මෙවලම් තීරු බොත්තම සමග RIGHT ARROW හෝ LEFT ARROW.මෙවලම් තීරු බොත්තම සක්‍රිය කර ගැනීමට  SPACE හෝ  ENTER බොත්තම ඔබන්න."}]},{name:"විධාන",items:[{name:"විධානය වෙනස් ",legend:"ඔබන්න ${වෙනස් කිරීම}"},{name:"විධාන නැවත් පෙර පරිදිම වෙනස්කර ගැනීම.",legend:"ඔබන්න ${නැවත් පෙර පරිදිම වෙනස්කර ගැනීම}"},{name:"තද අකුරින් විධාන",legend:"ඔබන්න ${තද }"},
{name:"බැධී අකුරු විධාන",legend:"ඔබන්න ${බැධී අකුරු }"},{name:"යටින් ඉරි ඇද ඇති විධාන.",legend:"ඔබන්න ${යටින් ඉරි ඇද ඇති}"},{name:"සම්බන්ධිත විධාන",legend:"ඔබන්න ${සම්බන්ධ }"},{name:"මෙවලම් තීරු හැකුලුම් විධාන",legend:"ඔබන්න ${මෙවලම් තීරු හැකුලුම් }"},{name:"යොමුවීමට පෙර  වැදගත්  විධාන",legend:"ඔබන්න ${යොමුවීමට ඊළඟ }"},{name:"යොමුවීමට ඊළග වැදගත්  විධාන",legend:"ඔබන්න ${යොමුවීමට ඊළඟ }"},{name:"ප්‍රවේශ ",legend:"ඔබන්න  ${a11y }"}]}]});                                                                                                                                                                                                                                icense	http://opensource.org/licenses/MIT	MIT License
 * @link	http://codeigniter.com
 * @since	Version 3.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CodeIgniter Wincache Caching Class
 *
 * Read more about Wincache functions here:
 * http://www.php.net/manual/en/ref.wincache.php
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	Core
 * @author		Mike Murkovic
 * @link
 */
class CI_Cache_wincache extends CI_Driver {

	/**
	 * Get
	 *
	 * Look for a value in the cache. If it exists, return the data,
	 * if not, return FALSE
	 *
	 * @param	string	$id	Cache Ide
	 * @return	mixed	Value that is stored/FALSE on failure
	 */
	public function get($id)
	{
		$success = FALSE;
		$data = wincache_ucache_get($id, $success);

		// Success returned by reference from wincache_ucache_get()
		return ($success) ? $data : FALSE;
	}

	// ------------------------------------------------------------------------

	/**
	 * Cache Save
	 *
	 * @param	string	$id	Cache ID
	 * @param	mixed	$data	Data to store
	 * @param	int	$ttl	Time to live (in seconds)
	 * @param	bool	$raw	Whether to store the raw value (unused)
	 * @return	bool	true on success/false on failure
	 */
	public function save($id, $data, $ttl = 60, $raw = FALSE)
	{
		return wincache_ucache_set($id, $data, $ttl);
	}

	// ------------------------------------------------------------------------

	/**
	 * Delete from Cache
	 *
	 * @param	mixed	unique identifier of the item in the cache
	 * @return	bool	true on success/false on failure
	 */
	public function delete($id)
	{
		return wincache_ucache_delete($id);
	}

	// ------------------------------------------------------------------------

	/**
	 * Increment a raw value
	 *
	 * @param	string	$id	Cache ID
	 * @param	int	$offset	Step/value to add
	 * @return	mixed	New value on success or FALSE on failure
	 */
	public function increment($id, $offset = 1)
	{
		$success = FALSE;
		$value = wincache_ucache_inc($id, $offset, $success);

		return ($success === TRUE) ? $value : FALSE;
	}

	// ------------------------------------------------------------------------

	/**
	 * Decrement a raw value
	 *
	 * @param	string	$id	Cache ID
	 * @param	int	$offset	Step/value to reduce by
	 * @return	mixed	New value on success or FALSE on failure
	 */
	public function decrement($id, $offset = 1)
	{
		$success = FALSE;
		$value = wincache_ucache_dec($id, $offset, $success);

		return ($success === TRUE) ? $value : FALSE;
	}

	// -----------------------------------------------------------------﻿/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","ru",{title:"Горячие клавиши",contents:"Помощь. Для закрытия этого окна нажмите ESC.",legend:[{name:"Основное",items:[{name:"Панель инструментов",legend:"Нажмите ${toolbarFocus} для перехода к панели инструментов. Для перемещения между группами панели инструментов используйте TAB и SHIFT-TAB. Для перемещения между кнопками панели иструментов используйте кнопки ВПРАВО или ВЛЕВО. Нажмите ПРОБЕЛ или ENTER для запуска кнопки панели инструментов."},{name:"Диалоги",legend:"В диалоговом окне, нажмите клавишу TAB для перехода к следующему диалоговому полю, нажмите клавиши SHIFT + TAB, чтобы перейти к предыдущему полю, нажмите ENTER, чтобы отправить данные, нажмите клавишу ESC, для отмены. Для окон, которые имеют несколько вкладок, нажмите ALT + F10 для перехода к списку вкладок. Переход к следующей вкладке TAB ИЛИ ПРАВУЮ СТРЕЛКУ. Переход к предыдущей вкладке с помощью SHIFT + TAB или ЛЕВАЯ СТРЕЛКА. Нажмите ПРОБЕЛ или ENTER, чтобы выбрать вкладку."},
{name:"Контекстное меню",legend:'Нажмите ${contextMenu} или клавишу APPLICATION, чтобы открыть контекстное меню. Затем перейдите к следующему пункту меню с помощью TAB или стрелкой "ВНИЗ". Переход к предыдущей опции - SHIFT+TAB или стрелкой "ВВЕРХ". Нажмите SPACE, или ENTER, чтобы задействовать опцию меню. Открыть подменю текущей опции - SPACE или ENTER или стрелкой "ВПРАВО". Возврат к родительскому пункту меню - ESC или стрелкой "ВЛЕВО". Закрытие контекстного меню - ESC.'},{name:"Редактор списка",
legend:'Внутри окна списка, переход к следующему пункту списка - TAB или стрелкой "ВНИЗ". Переход к предыдущему пункту списка - SHIFT + TAB или стрелкой "ВВЕРХ". Нажмите SPACE, или ENTER, чтобы задействовать опцию списка. Нажмите ESC, чтобы закрыть окно списка.'},{name:"Путь к элементу",legend:'Нажмите ${elementsPathFocus}, чтобы перейти к панели пути элементов. Переход к следующей кнопке элемента - TAB или стрелкой "ВПРАВО". Переход к предыдущей кнопку - SHIFT+TAB или стрелкой "ВЛЕВО". Нажмите SPACE, или ENTER, чтобы выбрать элемент в редакторе.'}]},
{name:"Команды",items:[{name:"Отменить",legend:"Нажмите ${undo}"},{name:"Повторить",legend:"Нажмите ${redo}"},{name:"Полужирный",legend:"Нажмите ${bold}"},{name:"Курсив",legend:"Нажмите ${italic}"},{name:"Подчеркнутый",legend:"Нажмите ${underline}"},{name:"Гиперссылка",legend:"Нажмите ${link}"},{name:"Свернуть панель инструментов",legend:"Нажмите ${toolbarCollapse}"},{name:"Команды доступа к предыдущему фокусному пространству",legend:'Нажмите ${accessPreviousSpace}, чтобы обратиться к ближайшему недостижимому фокусному пространству перед символом "^", например: два смежных HR элемента. Повторите комбинацию клавиш, чтобы достичь отдаленных фокусных пространств.'},
{name:"Команды доступа к следующему фокусному пространству",legend:"Press ${accessNextSpace} to access the closest unreachable focus space after the caret, for example: two adjacent HR elements. Repeat the key combination to reach distant focus spaces."},{name:"Справка по горячим клавишам",legend:"Нажмите ${a11yHelp}"}]}]});                                                                                                                                                                 IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (http://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2015, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	http://codeigniter.com
 * @since	Version 3.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CodeIgniter Redis Caching Class
 *
 * @package	   CodeIgniter
 * @subpackage Libraries
 * @category   Core
 * @author	   Anton Lindqvist <anton@qvister.se>
 * @link
 */
class CI_Cache_redis extends CI_Driver
{
	/**
	 * Default config
	 *
	 * @static
	 * @var	array
	 */
	protected static $_default_config = array(
		'socket_type' => 'tcp',
		'host' => '127.0.0.1',
		'password' => NULL,
		'port' => 6379,
		'timeout' => 0
	);

	/**
	 * Redis connection
	 *
	 * @var	Redis
	 */
	protected $_redis;

	/**
	 * An internal cache for storing keys of serialized values.
	 *
	 * @var	array
	 */
	protected $_serialized = array();

	// ------------------------------------------------------------------------

	/**
	 * Class constructor
	 *
	 * Setup Redis
	 *
	 * Loads Redis config file if present. Will halt execution
	 * if a Redis connection can't be established.
	 *
	 * @return	void
	 * @see		Redis::connect()
	 */
	public function __construct()
	{
		$config = array();
		$CI =& get_instance();

		if ($CI->config->load('redis', TRUE, TRUE))
		{
			$config = $CI->config->item('redis');
		}

		$config = array_merge(self::$_default_config, $config);
		$this->_redis = new Redis();

		try
		{
			if ($config['socket_type'] === 'unix')
			{
				$success = $this->_redis->connect($config['socket']);
			}
			else // tcp socket
			{
				$success = $this->_redis->connect($config['host'], $config['port'], $config['timeout']);
			}

			if ( ! $success)
			{
				log_message('error', 'Cache: Redis connection failed. Check your configuration.');
			}

			if (isset($config['password']) && ! $this->_redis->auth($config['password']))
			{
				log_message('error', 'Cache: Redis authentication failed.');
			}
		}
		catch (RedisException $e)
		{
			log_message('error', 'Cache: Redis connection refused ('.$e->getMessage().')');
		}

		// Initialize the index of serialized values.
		$serialized = $this->_redis->sMembers('_ci_redis_serialized');
		empty($serialized) OR $this->_serialized = array_flip($serialized);
	}

	// ------------------------------------------------------------------------

	/**
	 * Get cache
	 *
	 * @param	string	Cache ID
	 * @return	mixed
	 */
	public function get($key)
	{
		$value = $this->_redis->get($key);

		if ($value !== FALSE && isset($this->_serialized[$key]))
		{
			return unserialize($value);
		}

		return $value;
	}

	// ----<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * MS SQL Forge Class
 *
 * @category	Database
 * @author		ExpressionEngine Dev Team
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_mssql_forge extends CI_DB_forge {

	/**
	 * Create database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _create_database($name)
	{
		return "CREATE DATABASE ".$name;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _drop_database($name)
	{
		return "DROP DATABASE ".$name;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	private
	 * @return	bool
	 */
	function _drop_table($table)
	{
		return "DROP TABLE ".$this->db->_escape_identifiers($table);
	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	private
	 * @param	string	the table name
	 * @param	array	the fields
	 * @param	mixed	primary key(s)
	 * @param	mixed	key(s)
	 * @param	boolean	should 'IF NOT EXISTS' be added to the SQL
	 * @return	bool
	 */
	function _create_table($table, $fields, $primary_keys, $keys, $if_not_exists)
	{
		$sql = 'CREATE TABLE ';

		if ($if_not_exists === TRUE)
		{
			$sql .= 'IF NOT EXISTS ';
		}

		$sql .= $this->db->_escape_identifiers($table)." (";
		$current_field_count = 0;

		foreach ($fields as $field=>$attributes)
		{
			// Numeric field names aren't allowed in databases, so if the key is
			// numeric, we know it was assigned by PHP and the developer manually
			// entered the field information, so we'll simply add it to the list
			if (is_numeric($field))
			{
				$sql .= "\n\t$attributes";
			}
			else
			{
				$attributes = array_change_key_case($attributes, CASE_UPPER);

				$sql .= "\n\t".$this->db->_protect_identifiers($field);

				$sql .=  ' '.$attributes['TYPE'];

				if (array_key_exists('CONSTRAINT', $attributes))
				{
					$sql .= '('.$attributes['CONSTRAINT'].')';
				}

				if (array_key_exists('UNSIGNED', $attributes) && $attributes['UNSIGNED'] === TRUE)
				{
					$sql .= ' UNSIGNED';
				}

				if (array_key_exists('DEFAULT', $attributes))
				{
					$sql .= ' DEFAULT \''.$attributes['DEFAULT'].'\'';
				}

				if (array_key_exists('NULL', $attributes) && $attributes['NULL'] === TRUE)
				{
					$sql .= ' NULL';
				}
				else
				{
					$sql .= ' NOT NULL';
				}

				if (array_key_exists('AUTO_INCREMENT', $attributes) && $attributes['AUTO_INCREMENT'] === TRUE)
				{
					$sql .= ' AUTO_INCREMENT';
				}
			}

			// don't add a comma on the end of the last field
			if (++$current_field_count < count($fields))
			{
				$sql .= ',';
			}
		}

		if (count($primary_keys) > 0)
		{
			$primary_keys = $this->db->_protect_identifiers($primary_keys);
			$sql .= ",\n\tPRIMARY KEY (" . implode(', ', $primary_keys) . ")";
		}

		if (is_array($keys) && count($keys) > 0)
		{
			foreach ($keys as $key)
			{
				if (is_array($key))
				{
					$key = $this->db->_protect_identifiers($key);
				}
				else
				{
					$key = array($this->db->_protect_identifiers($key));
				}

				$sql .= ",\n\tFOREIGN KEY (" . implode(', ', $key) . ")";
			}
		}

		$sql .= "\n)";

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Alter table query
	 *
	 * Generates a platform-specific query so that a table can be altered
	 * Called by add_column(), drop_column(), and column_alter(),
	 *
	 * @access	private
	 * @param	string	the ALTER type (ADD, DROP, CHANGE)
	 * @param	string	the column name
	 * @param	string	the table name
	 * @param	string	the column definition
	 * @param	string	the default value
	 * @param	boolean	should 'NOT NULL' be added
	 * @param	string	the field after which we should add the new field
	 * @return	object
	 */
	function _alter_table($alter_type, $table, $column_name, $column_definition = '', $default_value = '', $null = '', $after_field = '')
	{
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table)." $alter_type ".$this->db->_protect_identifiers($column_name);

		// DROP has everything it needs now.
		if ($alter_type == 'DROP')
		{
			return $sql;
		}

		$sql .= " $column_definition";

		if ($default_value != '')
		{
			$sql .= " DEFAULT \"$default_value\"";
		}

		if ($null === NULL)
		{
			$sql .= ' NULL';
		}
		else
		{
			$sql .= ' NOT NULL';
		}

		if ($after_field != '')
		{
			$sql .= ' AFTER ' . $this->db->_protect_identifiers($after_field);
		}

		return $sql;

	}

	// --------------------------------------------------------------------

	/**
	 * Rename a table
	 *
	 * Generates a platform-specific query so that a table can be renamed
	 *
	 * @access	private
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	string
	 */
	function _rename_table($table_name, $new_table_name)
	{
		// I think this syntax will work, but can find little documentation on renaming tables in MSSQL
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table_name)." RENAME TO ".$this->db->_protect_identifiers($new_table_name);
		return $sql;
	}

}

/* End of file mssql_forge.php */
/* Location: ./system/database/drivers/mssql/mssql_forge.php */                                                                                                                                                                                                                                                                                                                                                                'is_array'	=> $is_array,
			'keys'		=> $indexes,
			'postdata'	=> NULL,
			'error'		=> ''
		);

		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * By default, form validation uses the $_POST array to validate
	 *
	 * If an array is set through this method, then this array will
	 * be used instead of the $_POST array
	 *
	 * Note that if you are validating multiple arrays, then the
	 * reset_validation() function should be called after validating
	 * each array due to the limitations of CI's singleton
	 *
	 * @param	array	$data
	 * @return	CI_Form_validation
	 */
	public function set_data(array $data)
	{
		if ( ! empty($data))
		{
			$this->validation_data = $data;
		}

		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set Error Message
	 *
	 * Lets users set their own error messages on the fly. Note:
	 * The key name has to match the function name that it corresponds to.
	 *
	 * @param	array
	 * @param	string
	 * @return	CI_Form_validation
	 */
	public function set_message($lang, $val = '')
	{
		if ( ! is_array($lang))
		{
			$lang = array($lang => $val);
		}

		$this->_error_messages = array_merge($this->_error_messages, $lang);
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set The Error Delimiter
	 *
	 * Permits a prefix/suffix to be added to each error message
	 *
	 * @param	string
	 * @param	string
	 * @return	CI_Form_validation
	 */
	public function set_error_delimiters($prefix = '<p>', $suffix = '</p>')
	{
		$this->_error_prefix = $prefix;
		$this->_error_suffix = $suffix;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Get Error Message
	 *
	 * Gets the error message associated with a particular field
	 *
	 * @param	string	$field	Field name
	 * @param	string	$prefix	HTML start tag
	 * @param 	string	$suffix	HTML end tag
	 * @return	string
	 */
	public function error($field, $prefix = '', $suff<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		Esen Sagynov
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 2.0.2
 * @filesource
 */

// --------------------------------------------------------------------

/**
 * CUBRID Result Class
 *
 * This class extends the parent result class: CI_DB_result
 *
 * @category	Database
 * @author		Esen Sagynov
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_cubrid_result extends CI_DB_result {

	/**
	 * Number of rows in the result set
	 *
	 * @access	public
	 * @return	integer
	 */
	function num_rows()
	{
		return @cubrid_num_rows($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Number of fields in the result set
	 *
	 * @access	public
	 * @return	integer
	 */
	function num_fields()
	{
		return @cubrid_num_fields($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Fetch Field Names
	 *
	 * Generates an array of column names
	 *
	 * @access	public
	 * @return	array
	 */
	function list_fields()
	{
		return cubrid_column_names($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Field data
	 *
	 * Generates an array of objects containing field meta-data
	 *
	 * @access	public
	 * @return	array
	 */
	function field_data()
	{
		$retval = array();

		$tablePrimaryKeys = array();

		while ($field = cubrid_fetch_field($this->result_id))
		{
			$F				= new stdClass();
			$F->name		= $field->name;
			$F->type		= $field->type;
			$F->default		= $field->def;
			$F->max_length	= $field->max_length;

			// At this moment primary_key property is not returned when
			// cubrid_fetch_field is called. The following code will
			// provide a patch for it. primary_key property will be added
			// in the next release.

			// TODO: later version of CUBRID will provide primary_key
			// property.
			// When PK is defined in CUBRID, an index is automatically
			// created in the db_index system table in the form of
			// pk_tblname_fieldname. So the following will count how many
			// columns are there which satisfy this format.
			// The query will search for exact single columns, thus
			// compound PK is not supported.
			$res = cubrid_query($this->conn_id,
				"SELECT COUNT(*) FROM db_index WHERE class_name = '" . $field->table .
				"' AND is_primary_key = 'YES' AND index_name = 'pk_" .
				$field->table . "_" . $field->name . "'"
			);

			if ($res)
			{
				$row = cubrid_fetch_array($res, CUBRID_NUM);
				$F->primary_key = ($row[0] > 0 ? 1 : null);
			}
			else
			{
				$F->primary_key = null;
			}

			if (is_resource($res))
			{
				cubrid_close_request($res);
				$this->result_id = FALSE;
			}

			$retval[] = $F;
		}

		return $retval;
	}

	// --------------------------------------------------------------------

	/**
	 * Free the result
	 *
	 * @return	null
	 */
	function free_result()
	{
		if(is_resource($this->result_id) ||
			get_resource_type($this->result_id) == "Unknown" &&
			preg_match('/Resource id #/', strval($this->result_id)))
		{
			cubrid_close_request($this->result_id);
			$this->result_id = FALSE;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Data Seek
	 *
	 * Moves the internal pointer to the desired offset. We call
	 * this internally before fetching results to make sure the
	 * result set starts at zero
	 *
	 * @access	private
	 * @return	array
	 */
	function _data_seek($n = 0)
	{
		return cubrid_data_seek($this->result_id, $n);
	}

	// --------------------------------------------------------------------

	/**
	 * Result - associative array
	 *
	 * Returns the result set as an array
	 *
	 * @access	private
	 * @return	array
	 */
	function _fetch_assoc()
	{
		return cubrid_fetch_assoc($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Result - object
	 *
	 * Returns the result set as an object
	 *
	 * @access	private
	 * @return	object
	 */
	function _fetch_object()
	{
		return cubrid_fetch_object($this->result_id);
	}

}


/* End of file cubrid_result.php */
/* Location: ./system/database/drivers/cubrid/cubrid_result.php */                                                                                                      ring
	 */
	function reduce_multiples($str, $character = ',', $trim = FALSE)
	{
		$str = preg_replace('#'.preg_quote($character, '#').'{2,}#', $character, $str);
		return ($trim === TRUE) ? trim($str, $character) : $str;
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('random_string'))
{
	/**
	 * Create a Random String
	 *
	 * Useful for generating passwords or hashes.
	 *
	 * @param	string	type of random string.  basic, alpha, alnum, numeric, nozero, unique, md5, encrypt and sha1
	 * @param	int	number of characters
	 * @return	string
	 */
	function random_string($type = 'alnum', $len = 8)
	{
		switch ($type)
		{
			case 'basic':
				return mt_rand();
			case 'alnum':
			case 'numeric':
			case 'nozero':
			case 'alpha':
				switch ($type)
				{
					case 'alpha':
						$pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'alnum':
						$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'numeric':
						$pool = '0123456789';
						break;
					case 'nozero':
						$pool = '123456789';
						break;
				}
				return substr(str_shuffle(str_repeat($pool, ceil($len / strlen($pool)))), 0, $len);
			case 'unique': // todo: remove in 3.1+
			case 'md5':
				return md5(uniqid(mt_rand()));
			case 'encrypt': // todo: remove in 3.1+
			case 'sha1':
				return sha1(uniqid(mt_rand(), TRUE));
		}
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('increment_string'))
{
	/**
	 * Add's _1 to a string or increment the ending number to allow _2, _3, etc
	 *
	 * @param	string	required
	 * @param	string	What should the duplicate number be appended with
	 * @param	string	Which number should be used for the first dupe increment
	 * @return	string
	 */
	function increment_string($str, $separator = '_', $first = 1)
	{
		preg_match('/(.+)'.preg_quote($separator, '/').'([0-9]+)$/', $str, $match);
		return isset($match[2]) ? $match[1].$separator.($match[2] + 1) : $str.$separator.$first;
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('alternator'))
{
	/**
	 * Alternator
	 *
	 * Allows strings to be alternated. See docs...
	 *
	 * @param	string (as many parameters as needed)
	 * @return	string
	 */
	function alternator($args)
	{
		static $i;

		if (func_num_args() === 0)
		{
			$i = 0;
			return '';
		}
		$args = func_get_args();
		return $args[($i++ % count($args))];
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('repeater'))
{
	/**
	 * Repeater function
	 *
	 * @todo	Remove in version 3.1+.
	 * @deprecated	3.0.0	This is just an alias for PHP's native str_repeat()
	 *
	 * @param	string	$data	String to repeat
	 * @param	int	$num	Number of repeats
	 * @return	string
	 */
	function repeater($data, $num = 1)
	{
		return ($num > 0) ? str_repeat($data, $num) : '';
	}
}
                                                                               p_timeout);

		if ( ! is_resource($this->_smtp_connect))
		{
			$this->_set_error_message('lang:email_smtp_error', $errno.' '.$errstr);
			return FALSE;
		}

		stream_set_timeout($this->_smtp_connect, $this->smtp_timeout);
		$this->_set_error_message($this->_get_smtp_data());

		if ($this->smtp_crypto === 'tls')
		{
			$this->_send_command('hello');
			$this->_send_command('starttls');

			$crypto = stream_socket_enable_crypto($this->_smtp_connect, TRUE, STREAM_CRYPTO_METHOD_TLS_CLIENT);

			if ($crypto !==�PNG

   IHDR   �   :   ��   sBIT|d�   	pHYs  �  �B(�x   tEXtSoftware www.inkscape.org��<  �IDATx��y�UՕ�?����{5QLʠ�2dp �h�&�i��C3U9�^1IL�Z�i�3Ѭ�v�I��h�_'�N��jP�EDA�&j~ýg���x��QTh��k�u�wιg��}{���>����e���8���U����7|�p�X���XwҨ=��}�>�JF�;�wiT{���{V���Y����Sŷ	8ΈU3�W�>��{�B���;3�kC����`�o5��K:<M&#m���?��s�E���}�+�|�i�1^Ԟ㫽Ƴ���T�t�N#��33���S�M�>t�C}�kv�
�̊�]����U�*�*XMζ����>yk�V��w���Cϡ��x�fB9YM}k��Y�*=� `+�R�f;'�߶�oIق������K��0��󝑑Q�LE���N�8�������m�[�����m������СG�x7d8���o/��^�ҏ�HK��H��1��
2�1����h���m4Eɭ��qu=�\�p�-3- ��y7����6�l��r������^7(�㟏ȱ��{>W��+f�]��+S���P�px�-2�S���)�%Ȱ'�O���k���br�˔l�~��}X�͛��\�S����9,ޏ{���ؾo�K��8h3]��^Էj�4T�O2�Ã��d��dLF#�ǳ����~c��ʤ����S�x����#�sNycM�Mi_UcU�ǅ%��e�Ak�<Ǭ��ک�YN1�c3N�pbf��-�oK�Ǌ�FV�E��k#������a���'5�r_�q7W����vk�	��;��q��=���p�p�d��HN
�:�efV��YA�p"Vy�)Λ�1��G���m��o�9Z�6�x�>�w��a���Ϧ�8�n��a�ن��~�Ϧ���﬊��+�ҙ�AኼLr�ҳ��g]c��1"6��^�Y��2��s|�������ó���.��j��cO=h��p��-2��2v����ֱ`+��U~|d&���{"<U!֕i�4�8p�2|���{�6 �sB���V>j�%��:/�&ĺ�x�p(�-oڨ���H�Y��AÀ��k"<YI;��|��n8f ;�~V�Έ�6��)�]�Ԥhͧ2x��87/��4V':���R�8�w��d�p���� n�c�o5b[�a�>��j���IvpZǆV��&����LJ&alf��y�Q>m�3?/k�VL�+|�;r���[dTP����X�:3�q�%�xɱH��!=U�@�j�
E�p���}�Y'�z�����É�d�V@��;r���[d�jM̺��\��|}el����i�7�" ����Ŧ�8w���!�{gu����F"����M֎G|~Knwe�áE��5�u�	橲�)�	�A M�M�����Uq��9!*bK����5��|�@�\��^�j"b���dL1�
���wW�>Zt��w�Q�����j��a�1�`[�X:��j���L�a���[~�a%���c��o�D��JU_����pQ�/�l}8��6|���7�o7ư���`�x�3�䅪&���U�������͜�mc���᳕��'�[/%� ������РGRȮ�Q?�����?ُ�pͦ�}��%��8�c3��_��ڸ�ߦ��8u�VbVSb�Gex��ܱ��;>�jcjk��	�4��O�-`ƌ97�ٿv���46�^yyyer�ɳf���IF�s��O�kg����q��Qq|[Y^�ƫeee9���JW~/���ꪆ�sQQ�xgq~�қ 
Ͱa#/��_�����F�h���s>J6ѭ)do��r�:))d�2շm��������m�ͱ�.׌�!���9�1���n�K��1�FO�7o޼�����2s���{���>�d�[1e��ϧΘU�Z^,��GEO�޴iӂ_��?��o� ��ۂAgg��8���8'7��6�j�'����\���8жEEE����%EE����YZZ:�����!�
�}�6ɣ����OL�L�v�/1H
�XU67�)�^�%�r���+�Z��;�n� ����i������:b������6m�ɧ�5F�	܉rP�� �<	|Ud|W�cM�T��7V�Y������4�r�6�����G�,^�z���䟳����ݶ�����8ص�l=���SVV6L��{l�EK|�s���5gw�gz��Uј�ec�$�ZU~�I5����qy���S|Un����y����!|w���8�T6r�193/�Gw�&y[�L���~����4mڬ�֘� ؃�kV�u,w�Q�ٕ6�L?�~E�4)rޛ�+W�+/(Xګ�X�h��ߓ���W�C��{�^<�#�@5�j����QN�
ڂם%�6x�[?�djn�����+��͕����9I�. �j���,g��꽦<q��z���3f̹!+� 	"n
���� ��l+/�=�:`��w*�DU�kW�������U�qv����ư��ӌe�eW|wcU�U�N��W�F9oP&'e����95�;�Wm�{w/V5q˘��eW5q��m{�xx.w?����	��Y�*9cP�H"	7	b�୴����ޢ��k��._�yw��ԙ�nV�z .肵k�x�;�%���,�Z.T�I��1�w@�n�}�����}����`��ł���:�:�$U���@D�����H�w��7&~�1LR���E��P(��K/��1����Ã\7��@�ܷx��-<Pz�1�/"RPP���(���
}�=��5D�Zefn(e^:�ږ$���nr�O���߯߰��A�=(%��lE#�AÌ�-!�B&����U� �����x�;�e���W�ʿ�X~�<�Aqq�پ��j1�\�Se�����eee���Q5��;��qg2p%0Q��"r��\�'�))))p��~�ʉ-�9SU�"������g1�����?����cx�$���K�]7���'�1?HF}���('��;5��-�4���'5|���<�����V�i�w�k�ި�<���͍	鹊8;/�ת�`�3�C��e��=_?���r̛7/�p\K;���L�L�s)�o EX�n�ʴ�����l!�? ��ŋ������r�������jc�ҥ��Q�ť�'��/=�}�����E��"�#�-Y��������cT巪�|ii�7�.]��GS���E"z�e���L�%�3p���=��b/�V�0;7�1>h�u4�my�{�
ܵ��G���	C9�O�n����f�	C��ĳ��Y[a~^�|��'<'8x��r��G&`�P�;}����h���-kW�|�u�EE%���I�jun���#\W�U�O��K/l_���������W��+@II��"r����/�Яe˖}\XX8wذ�[���w߫W^ye����fj~���>�5�+F��nH&���k{���?#5�,��N^B�m�`R��G��*�s���ɅG䴕}����9!F��B<�rفȡ�k;�;���v��eь3��BWD�ی�SZ�����@�t�X0���|���-���;w�۾�,_�ܪ���\�q������`�ڮܫG�`U�i���3곩)Μ���:��t 5p���<S��O��1�u@��Ok)��g㇐ղ$��݉I��y�&0j�"),첬>��I�=�g��5gU�=���M����I]~��Q�e˖�i8&�,^�����-Z��� -�yr���^g�


��P�R���Ǯޫ��H<�l:/��f��"ۑ���I	!ZL83a#�6n�ȓ�n�.�����*o�FXY��䡵����&<}�Ȯ�0��?"��t)��/����9h�d���y���i�Z&��])�J�ʵGii�@U��j�D9��|MD��R���8s�ȏ�9%�n���іJ�~k7�Bkp{ks���TqѰ~����z�.���KF�' ����ol�?wԦ_4��]�aŊ>�1q&��p¼�N+�kW���$�>pZmS���:�iS�����U�]*�������z`8���KvwW���d\֪<��T�S�&�sڀ��t2Zu[���Ֆj�4����m�ިifX8@��t$���{��D����Q���T7�\��S�\�ҡon޺�h?U:��[�r2]�L��]h2��|a��>�.�~��鴋�Hm��|��m�-�Uy���Sf���e޴"j��o��g�*I"L�	��{K��g�[����K]6�k׼��c WM�>���O9%g�:úկ��-]Z2eƬ��1Ɩ��� ������.�W	2��Tm�GU�碢�y�U>���?�Z�>9�+�2Fueǵ.�BU��I9����<�����ceM3a#�q�N��C��RՒn�ދN>S���D���k@���e�솩3��:uƬoO�y�)3f�>e��̘��Sg��]isݚ�Z���4e���O�((X���ڟ������-B�*��מ�~�Gyt�����xMDW\������^."7w_~����&�^yY��Y#����i�U&'A�\݄�ʼA���iJ5�JZ��z2"��!Y�����d8�G��r���Ro�[�"z,Х0��U��.\8����O�B`��.�[OXIU�<�2fԈ�6���o��)3gW&� 3KJJ�~4���W_V
�7D"��������iU�}U3JDN�O�zc��ϙ c̟}_E����J��}˗/�/**�X��=���JW����6��xc����>~��g��ݩ�|k�o�-��}�k#����^�va��
���Q�7w4wMʤ~a��Y�X�)W���f��e��wbL��/�X�b��暕�260^��_O��AJT�Q���Vɚ�������"�?����I���B�����{�՗U\z饍��K��MPQ��yJ���o,�%H����ƨ�\׶��`ɒ%��p���\"�u��a��>�~�*׊p����Z�� rn~��Y�hQ��=��;�s��B��`�+�n�j����>��#r�{�n�T�]'�v!�5�18��yٜ18�܀�*����LEOW4�v]4uDL�jJ�
u�&��G�Dii���K�V��=
��������z�s'�F�1�7�;��K���٣�9ܷ��&Oq�0wP&�s�P�Y^�l��F��h�"�wH�0>L����'��Ƴ�ov��	���q�l)�,Sۯu9&�����q\��VvSc�g+y���׫���v4�I}ݗVL"bp�UY�����g���U2�y�㥞�%-³{gZ �f�d:�m�1*cIqr���<�O(q��V��ɝN��዇^��u�9�k}�w��(*|�#�����*����_���?���%Kz�J�-�?�}����O���o��IG�S��*�Fu�.�p@K6���F��m��l~ĳzI�yNN��|������א�b�Y�v����q��_���<`ջ$�,K:"��.���SM���=Ӈ��u�( �۴Փ 9���(����&^U3�����WqH��*������7�����>	�잿�ߦ˱�މ>|����t�o��cƶ\���BY�|9 �?�� ,X���^z)%�.''�C�ݖ-[����ѣGw����׷]�;w�>�x"�i����/�/_�:S؇/$dŊ]�8Ξ<90��*܈1n0c\�7!��E\cM�ߵ"A"D5 U�cЀ�:�qkDDTŀM"�QUUcPU�"�[+����<�x�q �!�W��j, qU'fM���<ǉ��1���xf,##ݲeK�_Ғpڇ^@��q���&����p(VQ�]7�煌㄀�!#��1!�JH��JHa����JH�UWT]� �+h � `PuD�-�HQC��|�Cl\!.*1Ec�ƌ!�*Q��(��#D}ը1���1Q jT��ڨ"�4G��u�Q�P(mnn�n߾��{?L�''N����Ԅ��p��0�Pص6�	6,"a��?l�	�ؐb�b4�JȪ�El$�!�	�!$�B�Bi�&M�����
D�D�HD�(���(T��DD$��A��� �U5�����$��L���x<.��-#F������$�{��1�knv��W��K��&���u�+�����
�
��*jP��/��b��*�I� 	3(jPDDQ�<u��P�"U՘���b4�ڨ�DElT�D�hT�D-��U�I"�/�U5�G5n��D�<�w�$���N�t������]7���P��|'�8~�w4d|㪱!�5�ź������V%��Հ1P�A����QԈ�$ܢ�jĪ�Q�">�'���%���jL!n�BI�Q��56j�u�1ϘhИ���bYYY����hEEE�ss�%o�a�:�<�c��̀[Wt�Ѡ8ͮ�	�c\	:�O5�h0 k���Uu�Q�Qp�`�bT��vX�f�`,���#�*VD|���b}O��%@\=��[���.qW5&��}�777�***�=�,��M�/�����    IEND�B`�                                                                                                                                                                                                                                                                                                                                                                                                                               <p>
        &copy; Copyright 2014 - 2017, British Columbia Institute of Technology.
      Last updated on Sep 25, 2017.
    </p>
  </div>

  Built with <a href="http://sphinx-doc.org/">Sphinx</a> using a <a href="https://github.com/snide/sphinx_rtd_theme">theme</a> provided by <a href="https://readthedocs.org">Read the Docs</a>.
  
</footer>
        </div>
      </div>

    </section>

  </div>
  


  

    <script type="text/javascript">
        var DOCUMENTATION_OPTIONS = {
            URL_ROOT:'../',
            VERSION:'3.1.6',
            COLLAPSE_INDEX:false,
            FILE_SUFFIX:'.html',
            HAS_SOURCE:  false
        };
    </script>
      <script type="text/javascript" src="../_static/jquery.js"></script>
      <script type="text/javascript" src="../_static/underscore.js"></script>
      <script type="text/javascript" src="../_static/doctools.js"></script>

  

  
  
    <script type="text/javascript" src="../_static/js/theme.js"></script>
  

  
  
  <script type="text/javascript">
  ﻿/*
 Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","zh",{title:"輔助工具指南",contents:"說明內容。若要關閉此對話框請按「ESC」。",legend:[{name:"一般",items:[{name:"編輯器工具列",legend:"請按 ${toolbarFocus} 以導覽到工具列。利用 TAB 或 SHIFT+TAB 以便移動到下一個及前一個工具列群組。利用右方向鍵或左方向鍵以便移動到下一個及上一個工具列按鈕。按下空白鍵或 ENTER 鍵啟用工具列按鈕。"},{name:"編輯器對話方塊",legend:"在對話框中，按下 TAB 鍵以導覽到下一個對話框元素，按下 SHIFT+TAB 以移動到上一個對話框元素，按下 ENTER 以遞交對話框，按下 ESC 以取消對話框。當對話框有多個分頁時，可以使用 ALT+F10 或是在對話框分頁順序中的一部份按下 TAB 以使用分頁列表。焦點在分頁列表上時，分別使用右方向鍵及左方向鍵移動到下一個及上一個分頁。"},{name:"編輯器內容功能表",legend:"請按下「${contextMenu}」或是「應用程式鍵」以開啟內容選單。以「TAB」或是「↓」鍵移動到下一個選單選項。以「SHIFT + TAB」或是「↑」鍵移動到上一個選單選項。按下「空白鍵」或是「ENTER」鍵以選取選單選項。以「空白鍵」或「ENTER」或「→」開啟目前選項之子選單。以「ESC」或「←」回到父選單。以「ESC」鍵關閉內容選單」。"},
{name:"編輯器清單方塊",legend:"在清單方塊中，使用 TAB 或下方向鍵移動到下一個列表項目。使用 SHIFT+TAB 或上方向鍵移動到上一個列表項目。按下空白鍵或 ENTER 以選取列表選項。按下 ESC 以關閉清單方塊。"},{name:"編輯器元件路徑工具列",legend:"請按 ${elementsPathFocus} 以瀏覽元素路徑列。利用 TAB 或右方向鍵以便移動到下一個元素按鈕。利用 SHIFT 或左方向鍵以便移動到上一個按鈕。按下空白鍵或 ENTER 鍵來選取在編輯器中的元素。"}]},{name:"命令",items:[{name:"復原命令",legend:"請按下「${undo}」"},{name:"重複命令",legend:"請按下「 ${redo}」"},{name:"粗體命令",legend:"請按下「${bold}」"},{name:"斜體",legend:"請按下「${italic}」"},{name:"底線命令",legend:"請按下「${underline}」"},{name:"連結",legend:"請按下「${link}」"},
{name:"隱藏工具列",legend:"請按下「${toolbarCollapse}」"},{name:"存取前一個焦點空間命令",legend:"請按下 ${accessPreviousSpace} 以存取最近但無法靠近之插字符號前的焦點空間。舉例：二個相鄰的 HR 元素。\r\n重複按鍵以存取較遠的焦點空間。"},{name:"存取下一個焦點空間命令",legend:"請按下 ${accessNextSpace} 以存取最近但無法靠近之插字符號後的焦點空間。舉例：二個相鄰的 HR 元素。\r\n重複按鍵以存取較遠的焦點空間。"},{name:"協助工具說明",legend:"請按下「${a11yHelp}」"},{name:" Paste as plain text",legend:"Press ${pastetext}",legendEdge:"Press ${pastetext}, followed by ${paste}"}]}],tab:"Tab",pause:"Pause",capslock:"Caps Lock",escape:"Esc",pageUp:"Page Up",
pageDown:"Page Down",leftArrow:"向左箭號",upArrow:"向上鍵號",rightArrow:"向右鍵號",downArrow:"向下鍵號",insert:"插入",leftWindowKey:"左方 Windows 鍵",rightWindowKey:"右方 Windows 鍵",selectKey:"選擇鍵",numpad0:"Numpad 0",numpad1:"Numpad 1",numpad2:"Numpad 2",numpad3:"Numpad 3",numpad4:"Numpad 4",numpad5:"Numpad 5",numpad6:"Numpad 6",numpad7:"Numpad 7",numpad8:"Numpad 8",numpad9:"Numpad 9",multiply:"乘號",add:"新增",subtract:"減號",decimalPoint:"小數點",divide:"除號",f1:"F1",f2:"F2",f3:"F3",f4:"F4",f5:"F5",f6:"F6",f7:"F7",f8:"F8",f9:"F9",
f10:"F10",f11:"F11",f12:"F12",numLock:"Num Lock",scrollLock:"Scroll Lock",semiColon:"分號",equalSign:"等號",comma:"逗號",dash:"虛線",period:"句點",forwardSlash:"斜線",graveAccent:"抑音符號",openBracket:"左方括號",backSlash:"反斜線",closeBracket:"右方括號",singleQuote:"單引號"});                                                                                                                                                                                                                                                                                                                                                                                                                                                   lass="toctree-l2"><a class="reference internal" href="../database/utilities.html">Database Utilities Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../database/db_driver_reference.html">Database Driver Reference</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../helpers/index.html">Helpers</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../helpers/array_helper.html">Array Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/captcha_helper.html">CAPTCHA Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/cookie_helper.html">Cookie Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/date_helper.html">Date Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/directory_helper.html">Directory Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/download_helper.html">Download Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/email_helper.html">Email Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/file_helper.html">File Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/form_helper.html">Form Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/html_helper.html">HTML Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/inflector_helper.html">Inflector Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/language_helper.html">Language Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/number_helper.html">Number Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/path_helper.html">Path Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/security_helper.html">Security Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/smiley_helper.html">Smiley Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/string_helper.html">String Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/text_helper.html">Text Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/typography_helper.html">Typography Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/url_helper.html">URL Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/xml_helper.html">XML Helper</a></li>
</ul>
</li>
</ul>

          
        
      </div>
      &nbsp;
    </nav>

    <section data-toggle="wy-nav-shift" class="wy-nav-content-wrap">

      
      <nav class="wy-nav-top" role="navigation" aria-label="top navigation">
        <i data-toggle="wy-nav-top" class="fa fa-bars"></i>
        <a href="../index.html">CodeIgniter</a>
      </nav>


      
      <div class="wy-nav-content">
        <div class="rst-content">
          <div role="navigation" aria-label="breadcrumbs navigation">
  <ul class="wy-breadcrumbs">
    <li><a href="../index.html">Docs</a> &raquo;</li>
      
        <li><a href="index.html">Installation Instructions</a> &raquo;</li>
      
        <li><a href="upgrading.html">Upgrading From a Previous Version</a> &raquo;</li>
      
    <li>Upgrading from 1.4.1 to 1.5.0</li>
    <li class="wy-breadcrumbs-aside"﻿/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.lang['zh']={"editor":"RTF 編輯器","editorPanel":"RTF 編輯器面板","common":{"editorHelp":"按下 ALT 0 取得說明。","browseServer":"瀏覽伺服器","url":"URL","protocol":"通訊協定","upload":"上傳","uploadSubmit":"傳送至伺服器","image":"圖片","flash":"Flash","form":"表格","checkbox":"核取方塊","radio":"選項按鈕","textField":"文字欄位","textarea":"文字區域","hiddenField":"隱藏欄位","button":"按鈕","select":"選取欄位","imageButton":"影像按鈕","notSet":"<未設定>","id":"ID","name":"名稱","langDir":"語言方向","langDirLtr":"從左至右 (LTR)","langDirRtl":"從右至左 (RTL)","langCode":"語言代碼","longDescr":"完整描述 URL","cssClass":"樣式表類別","advisoryTitle":"標題","cssStyle":"樣式","ok":"確定","cancel":"取消","close":"關閉","preview":"預覽","resize":"調整大小","generalTab":"一般","advancedTab":"進階","validateNumberFailed":"此值不是數值。","confirmNewPage":"現存的修改尚未儲存，要開新檔案？","confirmCancel":"部份選項尚未儲存，要關閉對話框？","options":"選項","target":"目標","targetNew":"開新視窗 (_blank)","targetTop":"最上層視窗 (_top)","targetSelf":"相同視窗 (_self)","targetParent":"父視窗 (_parent)","langDirLTR":"由左至右 (LTR)","langDirRTL":"由右至左 (RTL)","styles":"樣式","cssClasses":"樣式表類別","width":"寬度","height":"高度","align":"對齊方式","alignLeft":"靠左對齊","alignRight":"靠右對齊","alignCenter":"置中對齊","alignTop":"頂端","alignMiddle":"中間對齊","alignBottom":"底端","invalidValue":"無效值。","invalidHeight":"高度必須為數字。","invalidWidth":"寬度必須為數字。","invalidCssLength":"「%1」的值應為正數，並可包含有效的 CSS 單位 (px, %, in, cm, mm, em, ex, pt, 或 pc)。","invalidHtmlLength":"「%1」的值應為正數，並可包含有效的 HTML 單位 (px 或 %)。","invalidInlineStyle":"行內樣式的值應包含一個以上的變數值組，其格式如「名稱:值」，並以分號區隔之。","cssLengthTooltip":"請輸入數值，單位是像素或有效的 CSS 單位 (px, %, in, cm, mm, em, ex, pt, 或 pc)。","unavailable":"%1<span class=\"cke_accessibility\">，無法使用</span>"},"about":{"copy":"Copyright &copy; $1. All rights reserved.","dlgTitle":"關於 CKEditor","help":"檢閱 $1 尋求幫助。","moreInfo":"關於授權資訊，請參閱我們的網站：","title":"關於 CKEditor","userGuide":"CKEditor 使用者手冊"},"basicstyles":{"bold":"粗體","italic":"斜體","strike":"刪除線","subscript":"下標","superscript":"上標","underline":"底線"},"blockquote":{"toolbar":"引用段落"},"clipboard":{"copy":"複製","copyError":"瀏覽器的安全性設定不允許編輯器自動執行複製動作。請使用鍵盤快捷鍵 (Ctrl/Cmd+C) 複製。","cut":"剪下","cutError":"瀏覽器的安全性設定不允許編輯器自動執行剪下動作。請使用鏐盤快捷鍵 (Ctrl/Cmd+X) 剪下。","paste":"貼上","pasteArea":"貼上區","pasteMsg":"請使用鍵盤快捷鍵 (<strong>Ctrl/Cmd+V</strong>) 貼到下方區域中並按下「確定」。","securityMsg":"因為瀏覽器的安全性設定，本編輯器無法直接存取您的剪貼簿資料，請您自行在本視窗進行貼上動作。","title":"貼上"},"contextmenu":{"options":"內容功能表選項"},"toolbar":{"toolbarCollapse":"摺疊工具列","toolbarExpand":"展開工具列","toolbarGroups":{"document":"文件","clipboard":"剪貼簿/復原","editing":"編輯選項","forms":"格式","basicstyles":"基本樣式","paragraph":"段落","links":"連結","insert":"插入","styles":"樣式","colors":"顏色","tools":"工具"},"toolbars":"編輯器工具列"},"elementspath":{"eleLabel":"元件路徑","eleTitle":"%1 個元件"},"format":{"label":"格式","panelTitle":"段落格式","tag_address":"地址","tag_div":"標準 (DIV)","tag_h1":"標題 1","tag_h2":"標題 2","tag_h3":"標題 3","tag_h4":"標題 4","tag_h5":"標題 5","tag_h6":"標題 6","tag_p":"標準","tag_pre":"格式設定"},"horizontalrule":{"toolbar":"插入水平線"},"image":{"alertUrl":"請輸入圖片 URL","alt":"替代文字","border":"框線","btnUpload":"傳送到伺服器","button2Img":"請問您確定要將「圖片按鈕」轉換成「圖片」嗎？","hSpace":"HSpace","img2Button":"請問您確定要將「圖片」轉換成「圖片按鈕」嗎？","infoTab":"影像資訊","linkTab":"連結","lockRatio":"固定比例","menu":"影像屬性","resetSize":"重設大小","title":"影像屬性","titleButton":"影像按鈕屬性","upload":"上傳","urlMissing":"遺失圖片來源之 URL ","vSpace":"VSpace","validateBorder":"框線必須是整數。","validateHSpace":"HSpace 必須是整數。","validateVSpace":"VSpace 必須是整數。"},"indent":{"indent":"增加縮排","outdent":"減少縮排"},"fakeobjects":{"anchor":"錨點","flash":"Flash 動畫","hiddenfield":"隱藏欄位","iframe":"IFrame","unknown":"無法辨識的物件"},"link":{"acccessKey":"便捷鍵","advanced":"進階","advisoryContentType":"建議內容類型","advisoryTitle":"標題","anchor":{"toolbar":"錨點","menu":"編輯錨點","title":"錨點內容","name":"錨點名稱","errorName":"請輸入錨點名稱","remove":"移除錨點"},"anchorId":"依元件編號","anchorName":"依錨點名稱","charset":"連結資源的字元集","cssClasses":"樣式表類別","emailAddress":"電子郵件地址","emailBody":"郵件本文","emailSubject":"郵件主旨","id":"ID","info":"連結資訊","langCode":"語言碼","langDir":"語言方向","langDirLTR":"由左至右 (LTR)","langDirRTL":"由右至左 (RTL)","menu":"編輯連結","name":"名稱","noAnchors":"(本文件中無可用之錨點)","noEmail":"請輸入電子郵件","noUrl":"請輸入連結 URL","other":"<其他>","popupDependent":"獨立 (Netscape)","popupFeatures":"快顯視窗功能","popupFullScreen":"全螢幕 (IE)","popupLeft":"左側位置","popupLocationBar":"位置列","popupMenuBar":"功能表列","popupResizable":"可調大小","popupScrollBars":"捲軸","popupStatusBar":"狀態列","popupToolbar":"工具列","popupTop":"頂端位置","rel":"關係","selectAnchor":"選取一個錨點","styles":"樣式","tabIndex":"定位順序","target":"目標","targetFrame":"<框架>","targetFrameName":"目標框架名稱","targetPopup":"<快顯視窗>","targetPopupName":"快顯視窗名稱","title":"連結","toAnchor":"文字中的錨點連結","toEmail":"電子郵件","toUrl":"網址","toolbar":"連結","type":"連結類型","unlink":"取消連結","upload":"上傳"},"list":{"bulletedlist":"插入/移除項目符號清單","numberedlist":"插入/移除編號清單清單"},"magicline":{"title":"在此插入段落"},"maximize":{"maximize":"最大化","minimize":"最小化"},"pastetext":{"button":"貼成純文字","title":"貼成純文字"},"pastefromword":{"confirmCleanup":"您想貼上的文字似乎是自 Word 複製而來，請問您是否要先清除 Word 的格式後再行貼上？","error":"由於發生內部錯誤，無法清除清除 Word 的格式。","title":"自 Word 貼上","toolbar":"自 Word 貼上"},"removeformat":{"toolbar":"移除格式"},"sourcearea":{"toolbar":"原始碼"},"specialchar":{"options":"特殊字元選項","title":"選取特殊字元","toolbar":"插入特殊字元"},"scayt":{"about":"關於即時拼寫檢查","aboutTab":"關於","addWord":"添加單詞","allCaps":"Ignore All-Caps Words","dic_create":"Create","dic_delete":"Delete","dic_field_name":"Dictionary name","dic_info":"Initially the User Dictionary is stored in a Cookie. However, Cookies are limited in size. When the User Dictionary grows to a point where it cannot be stored in a Cookie, then the dictionary may be stored on our server. To store your personal dictionary on our server you should specify a name for your dictionary. If you already have a stored dictionary, please type its name and click the Restore button.","dic_rename":"Rename","dic_restore":"Restore","dictionariesTab":"字典","disable":"關閉即時拼寫檢查","emptyDic":"字典名不應為空.","enable":"啟用即時拼寫檢查","ignore":"忽略","ignoreAll":"全部忽略","ignoreDomainNames":"Ignore Domain Names","langs":"語言","languagesTab":"語言","mixedCase":"Ignore Words with Mixed Case","mixedWithDigits":"Ignore Words with Numbers","moreSuggestions":"更多拼寫建議","opera_title":"Not supported by Opera","options":"選項","optionsTab":"選項","title":"即時拼寫檢查","toggle":"啟用／關閉即時拼寫檢查","noSuggestions":"No suggestion"},"stylescombo":{"label":"樣式","panelTitle":"Formatting Styles","panelTitle1":"區塊樣式","panelTitle2":"內嵌樣式","panelTitle3":"物件樣式"},"table":{"border":"框線大小","caption":"標題","cell":{"menu":"儲存格","insertBefore":"前方插入儲存格","insertAfter":"後方插入儲存格","deleteCell":"刪除儲存格","merge":"合併儲存格","mergeRight":"向右合併","mergeDown":"向下合併","splitHorizontal":"水平分割儲存格","splitVertical":"垂直分割儲存格","title":"儲存格屬性","cellType":"儲存格類型","rowSpan":"Rows Span","colSpan":"Columns Span","wordWrap":"自動斷行","hAlign":"水平對齊","vAlign":"垂直對齊","alignBaseline":"基準線","bgColor":"背景顏色","borderColor":"框線顏色","data":"資料","header":"Header","yes":"是","no":"否","invalidWidth":"儲存格寬度必須為數字。","invalidHeight":"儲存格高度必須為數字。","invalidRowSpan":"Rows span must be a whole number.","invalidColSpan":"Columns span must be a whole number.","chooseColor":"選擇"},"cellPad":"Cell padding","cellSpace":"Cell spacing","column":{"menu":"行","insertBefore":"Insert Column Before","insertAfter":"Insert Column After","deleteColumn":"Delete Columns"},"columns":"行","deleteTable":"Delete Table","headers":"Headers","headersBoth":"Both","headersColumn":"First column","headersNone":"無","headersRow":"First Row","invalidBorder":"框線大小必須是整數。","invalidCellPadding":"Cell padding must be a positive number.","invalidCellSpacing":"Cell spacing must be a positive number.","invalidCols":"Number of columns must be a number greater than 0.","invalidHeight":"Table height must be a number.","invalidRows":"Number of rows must be a number greater than 0.","invalidWidth":"Table width must be a number.","menu":"Table Properties","row":{"menu":"列","insertBefore":"Insert Row Before","insertAfter":"Insert Row After","deleteRow":"Delete Rows"},"rows":"列","summary":"Summary","title":"Table Properties","toolbar":"Table","widthPc":"百分比","widthPx":"像素","widthUnit":"寬度單位"},"undo":{"redo":"取消復原","undo":"復原"},"wsc":{"btnIgnore":"忽略","btnIgnoreAll":"全部忽略","btnReplace":"取代","btnReplaceAll":"全部取代","btnUndo":"復原","changeTo":"更改為","errorLoading":"無法聯系侍服器: %s.","ieSpellDownload":"尚未安裝拼字檢查元件。您是否想要現在下載？","manyChanges":"拼字檢查完成：更改了 %1 個單字","noChanges":"拼字檢查完成：未更改任何單字","noMispell":"拼字檢查完成：未發現拼字錯誤","noSuggestions":"- 無建議值 -","notAvailable":"抱歉，服務目前暫不可用","notInDic":"不在字典中","oneChange":"拼字檢查完成：更改了 1 個單字","progress":"進行拼字檢查中…","title":"拼字檢查","toolbar":"拼字檢查"}};                                                                                                                                                                            sts('form_submit'))
{
	/**
	 * Submit Button
	 *
	 * @param	mixed
	 * @param	string
	 * @param	mixed
	 * @return	string
	 */
	function form_submit($data = '', $value = '', $extra = '')
	{
		$defaults = array(
			'type' => 'submit',
			'name' => is_array($data) ? '' : $data,
			'value' => $value
		);

		return '<input '._parse_form_attributes($data, $defaults)._attributes_to_string($extra)." />\n";
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('form﻿/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.lang['zh-cn']={"editor":"所见即所得编辑器","editorPanel":"所见即所得编辑器面板","common":{"editorHelp":"按 ALT+0 获得帮助","browseServer":"浏览服务器","url":"URL","protocol":"协议","upload":"上传","uploadSubmit":"上传到服务器","image":"图像","flash":"Flash","form":"表单","checkbox":"复选框","radio":"单选按钮","textField":"单行文本","textarea":"多行文本","hiddenField":"隐藏域","button":"按钮","select":"列表/菜单","imageButton":"图像按钮","notSet":"<没有设置>","id":"ID","name":"名称","langDir":"语言方向","langDirLtr":"从左到右 (LTR)","langDirRtl":"从右到左 (RTL)","langCode":"语言代码","longDescr":"详细说明 URL","cssClass":"样式类名称","advisoryTitle":"标题","cssStyle":"行内样式","ok":"确定","cancel":"取消","close":"关闭","preview":"预览","resize":"拖拽以改变大小","generalTab":"常规","advancedTab":"高级","validateNumberFailed":"需要输入数字格式","confirmNewPage":"当前文档内容未保存，是否确认新建文档？","confirmCancel":"部分修改尚未保存，是否确认关闭对话框？","options":"选项","target":"目标窗口","targetNew":"新窗口 (_blank)","targetTop":"整页 (_top)","targetSelf":"本窗口 (_self)","targetParent":"父窗口 (_parent)","langDirLTR":"从左到右 (LTR)","langDirRTL":"从右到左 (RTL)","styles":"样式","cssClasses":"样式类","width":"宽度","height":"高度","align":"对齐方式","alignLeft":"左对齐","alignRight":"右对齐","alignCenter":"居中","alignTop":"顶端","alignMiddle":"居中","alignBottom":"底部","invalidValue":"无效的值。","invalidHeight":"高度必须为数字格式","invalidWidth":"宽度必须为数字格式","invalidCssLength":"此“%1”字段的值必须为正数，可以包含或不包含一个有效的 CSS 长度单位(px, %, in, cm, mm, em, ex, pt 或 pc)","invalidHtmlLength":"此“%1”字段的值必须为正数，可以包含或不包含一个有效的 HTML 长度单位(px 或 %)","invalidInlineStyle":"内联样式必须为格式是以分号分隔的一个或多个“属性名 : 属性值”。","cssLengthTooltip":"输入一个表示像素值的数字，或加上一个有效的 CSS 长度单位(px, %, in, cm, mm, em, ex, pt 或 pc)。","unavailable":"%1<span class=\"cke_accessibility\">，不可用</span>"},"about":{"copy":"版权所有 &copy; $1。<br />保留所有权利。","dlgTitle":"关于 CKEditor","help":"访问 $1 以获取帮助。","moreInfo":"相关授权许可信息请访问我们的网站：","title":"关于 CKEditor","userGuide":"CKEditor 用户向导"},"basicstyles":{"bold":"加粗","italic":"倾斜","strike":"删除线","subscript":"下标","superscript":"上标","underline":"下划线"},"blockquote":{"toolbar":"块引用"},"clipboard":{"copy":"复制","copyError":"您的浏览器安全设置不允许编辑器自动执行复制操作，请使用键盘快捷键(Ctrl/Cmd+C)来完成。","cut":"剪切","cutError":"您的浏览器安全设置不允许编辑器自动执行剪切操作，请使用键盘快捷键(Ctrl/Cmd+X)来完成。","paste":"粘贴","pasteArea":"粘贴区域","pasteMsg":"请使用键盘快捷键(<STRONG>Ctrl/Cmd+V</STRONG>)把内容粘贴到下面的方框里，再按 <STRONG>确定</STRONG>","securityMsg":"因为您的浏览器的安全设置原因，本编辑器不能直接访问您的剪贴板内容，你需要在本窗口重新粘贴一次。","title":"粘贴"},"contextmenu":{"options":"快捷菜单选项"},"toolbar":{"toolbarCollapse":"折叠工具栏","toolbarExpand":"展开工具栏","toolbarGroups":{"document":"文档","clipboard":"剪贴板/撤销","editing":"编辑","forms":"表单","basicstyles":"基本格式","paragraph":"段落","links":"链接","insert":"插入","styles":"样式","colors":"颜色","tools":"工具"},"toolbars":"工具栏"},"elementspath":{"eleLabel":"元素路径","eleTitle":"%1 元素"},"format":{"label":"格式","panelTitle":"格式","tag_address":"地址","tag_div":"段落(DIV)","tag_h1":"标题 1","tag_h2":"标题 2","tag_h3":"标题 3","tag_h4":"标题 4","tag_h5":"标题 5","tag_h6":"标题 6","tag_p":"普通","tag_pre":"已编排格式"},"horizontalrule":{"toolbar":"插入水平线"},"image":{"alertUrl":"请输入图像地址","alt":"替换文本","border":"边框大小","btnUpload":"上传到服务器","button2Img":"确定要把当前图像按钮转换为普通图像吗？","hSpace":"水平间距","img2Button":"确定要把当前图像改变为图像按钮吗？","infoTab":"图像信息","linkTab":"链接","lockRatio":"锁定比例","menu":"图像属性","resetSize":"原始尺寸","title":"图像属性","titleButton":"图像域属性","upload":"上传","urlMissing":"缺少图像源文件地址","vSpace":"垂直间距","validateBorder":"边框大小必须为整数格式","validateHSpace":"水平间距必须为整数格式","validateVSpace":"垂直间距必须为整数格式"},"indent":{"indent":"增加缩进量","outdent":"减少缩进量"},"fakeobjects":{"anchor":"锚点","flash":"Flash 动画","hiddenfield":"隐藏域","iframe":"IFrame","unknown":"未知对象"},"link":{"acccessKey":"访问键","advanced":"高级","advisoryContentType":"内容类型","advisoryTitle":"标题","anchor":{"toolbar":"插入/编辑锚点链接","menu":"锚点链接属性","title":"锚点链接属性","name":"锚点名称","errorName":"请输入锚点名称","remove":"删除锚点"},"anchorId":"按锚点 ID","anchorName":"按锚点名称","charset":"字符编码","cssClasses":"样式类名称","emailAddress":"地址","emailBody":"内容","emailSubject":"主题","id":"ID","info":"超链接信息","langCode":"语言代码","langDir":"语言方向","langDirLTR":"从左到右 (LTR)","langDirRTL":"从右到左 (RTL)","menu":"编辑超链接","name":"名称","noAnchors":"(此文档没有可用的锚点)","noEmail":"请输入电子邮件地址","noUrl":"请输入超链接地址","other":"<其他>","popupDependent":"依附 (NS)","popupFeatures":"弹出窗口属性","popupFullScreen":"全屏 (IE)","popupLeft":"左","popupLocationBar":"地址栏","popupMenuBar":"菜单栏","popupResizable":"可缩放","popupScrollBars":"滚动条","popupStatusBar":"状态栏","popupToolbar":"工具栏","popupTop":"右","rel":"关联","selectAnchor":"选择一个锚点","styles":"行内样式","tabIndex":"Tab 键次序","target":"目标","targetFrame":"<框架>","targetFrameName":"目标框架名称","targetPopup":"<弹出窗口>","targetPopupName":"弹出窗口名称","title":"超链接","toAnchor":"页内锚点链接","toEmail":"电子邮件","toUrl":"地址","toolbar":"插入/编辑超链接","type":"超链接类型","unlink":"取消超链接","upload":"上传"},"list":{"bulletedlist":"项目列表","numberedlist":"编号列表"},"magicline":{"title":"在这插入段落"},"maximize":{"maximize":"全屏","minimize":"最小化"},"pastetext":{"button":"粘贴为无格式文本","title":"粘贴为无格式文本"},"pastefromword":{"confirmCleanup":"您要粘贴的内容好像是来自 MS Word，是否要清除 MS Word 格式后再粘贴？","error":"由于内部错误无法清理要粘贴的数据","title":"从 MS Word 粘贴","toolbar":"从 MS Word 粘贴"},"removeformat":{"toolbar":"清除格式"},"sourcearea":{"toolbar":"源码"},"specialchar":{"options":"特殊符号选项","title":"选择特殊符号","toolbar":"插入特殊符号"},"scayt":{"about":"关于即时拼写检查","aboutTab":"关于","addWord":"添加单词","allCaps":"忽略所有大写单词","dic_create":"创建","dic_delete":"删除","dic_field_name":"字典名称","dic_info":"一开始用户词典储存在 Cookie 中, 但是 Cookies 的容量是有限的, 当用户词典增长到超出 Cookie 限制时就无法再储存了, 这时您可以将词典储存到我们的服务器上. 要把您的个人词典到储存到我们的服务器上的话, 需要为您的词典指定一个名称, 如果您在我们的服务器上已经有储存有一个词典, 请输入词典名称并按还原按钮.","dic_rename":"重命名","dic_restore":"还原","dictionariesTab":"字典","disable":"禁用即时拼写检查","emptyDic":"字典名不应为空.","enable":"启用即时拼写检查","ignore":"忽略","ignoreAll":"全部忽略","ignoreDomainNames":"忽略域名","langs":"语言","languagesTab":"语言","mixedCase":"忽略大小写混合的单词","mixedWithDigits":"忽略带数字的单词","moreSuggestions":"更多拼写建议","opera_title":"不支持 Opera 浏览器","options":"选项","optionsTab":"选项","title":"即时拼写检查","toggle":"暂停/启用即时拼写检查","noSuggestions":"No suggestion"},"stylescombo":{"label":"样式","panelTitle":"样式","panelTitle1":"块级元素样式","panelTitle2":"内联元素样式","panelTitle3":"对象元素样式"},"table":{"border":"边框","caption":"标题","cell":{"menu":"单元格","insertBefore":"在左侧插入单元格","insertAfter":"在右侧插入单元格","deleteCell":"删除单元格","merge":"合并单元格","mergeRight":"向右合并单元格","mergeDown":"向下合并单元格","splitHorizontal":"水平拆分单元格","splitVertical":"垂直拆分单元格","title":"单元格属性","cellType":"单元格类型","rowSpan":"纵跨行数","colSpan":"横跨列数","wordWrap":"自动换行","hAlign":"水平对齐","vAlign":"垂直对齐","alignBaseline":"基线","bgColor":"背景颜色","borderColor":"边框颜色","data":"数据","header":"表头","yes":"是","no":"否","invalidWidth":"单元格宽度必须为数字格式","invalidHeight":"单元格高度必须为数字格式","invalidRowSpan":"行跨度必须为整数格式","invalidColSpan":"列跨度必须为整数格式","chooseColor":"选择"},"cellPad":"边距","cellSpace":"间距","column":{"menu":"列","insertBefore":"在左侧插入列","insertAfter":"在右侧插入列","deleteColumn":"删除列"},"columns":"列数","deleteTable":"删除表格","headers":"标题单元格","headersBoth":"第一列和第一行","headersColumn":"第一列","headersNone":"无","headersRow":"第一行","invalidBorder":"边框粗细必须为数字格式","invalidCellPadding":"单元格填充必须为数字格式","invalidCellSpacing":"单元格间距必须为数字格式","invalidCols":"指定的行数必须大于零","invalidHeight":"表格高度必须为数字格式","invalidRows":"指定的列数必须大于零","invalidWidth":"表格宽度必须为数字格式","menu":"表格属性","row":{"menu":"行","insertBefore":"在上方插入行","insertAfter":"在下方插入行","deleteRow":"删除行"},"rows":"行数","summary":"摘要","title":"表格属性","toolbar":"表格","widthPc":"百分比","widthPx":"像素","widthUnit":"宽度单位"},"undo":{"redo":"重做","undo":"撤消"},"wsc":{"btnIgnore":"忽略","btnIgnoreAll":"全部忽略","btnReplace":"替换","btnReplaceAll":"全部替换","btnUndo":"撤消","changeTo":"更改为","errorLoading":"加载应该服务主机时出错: %s.","ieSpellDownload":"拼写检查插件还没安装, 您是否想现在就下载?","manyChanges":"拼写检查完成: 更改了 %1 个单词","noChanges":"拼写检查完成: 没有更改任何单词","noMispell":"拼写检查完成: 没有发现拼写错误","noSuggestions":"- 没有建议 -","notAvailable":"抱歉, 服务目前暂不可用","notInDic":"没有在字典里","oneChange":"拼写检查完成: 更改了一个单词","progress":"正在进行拼写检查...","title":"拼写检查","toolbar":"拼写检查"}};                                                                                                  ------------------------------------------------

if ( ! function_exists('octal_permissions'))
{
	/**
	 * Octal Permissions
	 *
	 * Takes a numeric value representing a file's permissions and returns
	 * a three character string representing the file's octal permissions
	 *
	 * @param	int	$perms	Permissions
	 * @return	string
	 */
	function octal_permissions($perms)
	{
		return substr(sprintf('%o', $perms), -3);
	}
}
                                                                                           <?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		Esen Sagynov
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * CUBRID Forge Class
 *
 * @category	Database
 * @author		Esen Sagynov
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_cubrid_forge extends CI_DB_forge {

	/**
	 * Create database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _create_database($name)
	{
		// CUBRID does not allow to create a database in SQL. The GUI tools
		// have to be used for this purpose.
		return FALSE;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _drop_database($name)
	{
		// CUBRID does not allow to drop a database in SQL. The GUI tools
		// have to be used for this purpose.
		return FALSE;
	}

	// --------------------------------------------------------------------

	/**
	 * Process Fields
	 *
	 * @access	private
	 * @param	mixed	the fields
	 * @return	string
	 */
	function _process_fields($fields)
	{
		$current_field_count = 0;
		$sql = '';

		foreach ($fields as $field=>$attributes)
		{
			// Numeric field names aren't allowed in databases, so if the key is
			// numeric, we know it was assigned by PHP and the developer manually
			// entered the field information, so we'll simply add it to the list
			if (is_numeric($field))
			{
				$sql .= "\n\t$attributes";
			}
			else
			{
				$attributes = array_change_key_case($attributes, CASE_UPPER);

				$sql .= "\n\t\"" . $this->db->_protect_identifiers($field) . "\"";

				if (array_key_exists('NAME', $attributes))
				{
					$sql .= ' '.$this->db->_protect_identifiers($attributes['NAME']).' ';
				}

				if (array_key_exists('TYPE', $attributes))
				{
					$sql .= ' '.$attributes['TYPE'];

					if (array_key_exists('CONSTRAINT', $attributes))
					{
						switch ($attributes['TYPE'])
						{
							case 'decimal':
							case 'float':
							case 'numeric':
								$sql .= '('.implode(',', $attributes['CONSTRAINT']).')';
								break;
							case 'enum': 	// As of version 8.4.0 CUBRID does not support
											// enum data type.
											break;
							case 'set':
								$sql .= '("'.implode('","', $attributes['CONSTRAINT']).'")';
								break;
							default:
								$sql .= '('.$attributes['CONSTRAINT'].')';
						}
					}
				}

				if (array_key_exists('UNSIGNED', $attributes) && $attributes['UNSIGNED'] === TRUE)
				{
					//$sql .= ' UNSIGNED';
					// As of version 8.4.0 CUBRID does not support UNSIGNED INTEGER data type.
					// Will be supported in the next release as a part of MySQL Compatibility.
				}

				if (array_key_exists('DEFAULT', $attributes))
				{
					$sql .= ' DEFAULT \''.$attributes['DEFAULT'].'\'';
				}

				if (array_key_exists('NULL', $attributes) && $attributes['NULL'] === TRUE)
				{
					$sql .= ' NULL';
				}
				else
				{
					$sql .= ' NOT NULL';
				}

				if (array_key_exists('AUTO_INCREMENT', $attributes) && $attributes['AUTO_INCREMENT'] === TRUE)
				{
					$sql .= ' AUTO_INCREMENT';
				}

				if (array_key_exists('UNIQUE', $attributes) && $attributes['UNIQUE'] === TRUE)
				{
					$sql .= ' UNIQUE';
				}
			}

			// don't add a comma on the end of the last field
			if (++$current_field_count < count($fields))
			{
				$sql .= ',';
			}
		}

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	private
	 * @param	string	the table name
	 * @param	mixed	the fields
	 * @param	mixed	primary key(s)
	 * @param	mixed	key(s)
	 * @param	boolean	should 'IF NOT EXISTS' be added to the SQL
	 * @return	bool
	 */
	function _create_table($table, $fields, $primary_keys, $keys, $if_not_exists)
	{
		$sql = 'CREATE TABLE ';

		if ($if_not_exists === TRUE)
		{
			//$sql .= 'IF NOT EXISTS ';
			// As of version 8.4.0 CUBRID does not support this SQL syntax.
		}

		$sql .= $this->db->_escape_identifiers($table)." (";

		$sql .= $this->_process_fields($fields);

		// If there is a PK defined
		if (count($primary_keys) > 0)
		{
			$key_name = "pk_" . $table . "_" .
				$this->db->_protect_identifiers(implode('_', $primary_keys));
			
			$primary_keys = $this->db->_protect_identifiers($primary_keys);
			$sql .= ",\n\tCONSTRAINT " . $key_name . " PRIMARY KEY(" . implode(', ', $primary_keys) . ")";
		}

		if (is_array($keys) && count($keys) > 0)
		{
			foreach ($keys as $key)
			{
				if (is_array($key))
				{
					$key_name = $this->db->_protect_identifiers(implode('_', $key));
					$key = $this->db->_protect_identifiers($key);
				}
				else
				{
					$key_name = $this->db->_protect_identifiers($key);
					$key = array($key_name);
				}
				
				$sql .= ",\n\tKEY \"{$key_name}\" (" . implode(', ', $key) . ")";
			}
		}

		$sql .= "\n);";

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	private
	 * @return	string
	 */
	function _drop_table($table)
	{
		return "DROP TABLE IF EXISTS ".$this->db->_escape_identifiers($table);
	}

	// --------------------------------------------------------------------

	/**
	 * Alter table query
	 *
	 * Generates a platform-specific query so that a table can be altered
	 * Called by add_column(), drop_column(), and column_alter(),
	 *
	 * @access	private
	 * @param	string	the ALTER type (ADD, DROP, CHANGE)
	 * @param	string	the column name
	 * @param	array	fields
	 * @param	string	the field after which we should add the new field
	 * @return	object
	 */
	function _alter_table($alter_type, $table, $fields, $after_field = '')
	{
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table)." $alter_type ";

		// DROP has everything it needs now.
		if ($alter_type == 'DROP')
		{
			return $sql.$this->db->_protect_identifiers($fields);
		}

		$sql .= $this->_process_fields($fields);

		if ($after_field != '')
		{
			$sql .= ' AFTER ' . $this->db->_protect_identifiers($after_field);
		}

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Rename a table
	 *
	 * Generates a platform-specific query so that a table can be renamed
	 *
	 * @access	private
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	string
	 */
	function _rename_table($table_name, $new_table_name)
	{
		$sql = 'RENAME TABLE '.$this->db->_protect_identifiers($table_name)." AS ".$this->db->_protect_identifiers($new_table_name);
		return $sql;
	}

}

/* End of file cubrid_forge.php */
/* Location: ./system/database/drivers/cubrid/cubrid_forge.php */                                                                                                             �]���7~W-F��_��+�����:-��U/���,�Dv
f�]�~����ӻ�(�qqJCh*��L�o�I`�W�.�X7w#��Z]
7�=7�%֪1fl���	a\'bC��j����ė[D����ޣ�KH���h��o7����r�in�1�G�<`�E�7t��Ŷ���2�M�6�AC��b�$�]'�?�'��|���1|>��|���\E�[K�R�e�#�j�%���ꎑ�]�2�i���J�5�i���gE�%�˗q�)��S�
������M"�R�"��x�M1�dp��v8�~p��޻8P������w��#��",sw��\�U����VZ�5����s���B&�h��g|x�u"����N%M�Ul�#L vA�����v]�bT�ch�wD��5�g�4��!��$�C �F�B3J;jP�9���2<j�>*�9�T��]�-ϳ��J^`��bb X�"�f57�&���0f��T�9S�z�q�|��U̥�������g����g��@g�20�9>�	6��� �T��cP������|Rg��@����8~�}*BF*�d�,�fY�/V�\��M���`���^���և��V�@����{�a4(� (
���#'2N@�]E�5����M3��^� U1�f��}SՈ�=�������N�5�hυ���UM����
�Q��%�������Q]$[�ѲNn���X��vt��4ڥ��m�Sy<���S�/3�4� ���+�(�=��]��p�ڻ���T�j�Jf��G��{�vg�+!�~N�9��n��������-�WefwS�w��7����,�o�lQ�c�%�q<�i���+P6͔�K��$�����r	7):rqu�i��y��ɡ˔؀��L͐��^���ܢe�a�I�G�Ũ��;B���~�њ���r������Y]; W�kޤ�͌0�i}fu��:�h��n������u�%��3�N�i*-|l��<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
* Name:  Auth Lang - Slovenian
*
* Author: Žiga Drnovšček
* 		  ziga.drnovscek@gmail.com
*         
*
*
* Location: http://github.com/benedmunds/ion_auth/
*
* Created:  12.5.2013
*
* Description:  Slovenian language file for Ion Auth example views
*
*/

// Napaka
$lang['error_csrf'] = 'Slednji obrazec ni ustrezal našim varnostnim zahtevam.';

// Prijava
$lang['login_heading']         = 'Prijava';
$lang['login_subheading']      = 'Prosimo, spodaj se prijavite z vašim e-naslovom/uporabniškim imenom in geslom';
$lang['login_identity_label']  = 'E-naslov/Uporabniško ime:';
$lang['login_password_label']  = 'Geslo:';
$lang['login_remember_label']  = 'Zapomni si me:';
$lang['login_submit_btn']      = 'Prijava';
$lang['login_forgot_password'] = 'Pozabljeno geslo?';

// Index
$lang['index_heading']           = 'Uporabniki';
$lang['index_subheading']        = 'Spodaj je lista uporabnikov.';
$lang['index_fname_th']          = 'Ime';
$lang['index_lname_th']          = 'Priimek';
$lang['index_email_th']          = 'E-naslov';
$lang['index_groups_th']         = 'Skupine';
$lang['index_status_th']         = 'Status';
$lang['index_action_th']         = 'Akcija';
$lang['index_active_link']       = 'Aktiven';
$lang['index_inactive_link']     = 'Neaktiven';
$lang['index_create_user_link']  = 'Ustvari novega uporabnika';
$lang['index_create_group_link'] = 'Ustvari novo skupino';

// Deaktiviraj uporabnika
$lang['deactivate_heading']                  = 'Deaktiviraj uporabnika';
$lang['deactivate_subheading']               = 'Ali ste prepričani, da želite deaktivirati uporabnika \'%s\'';
$lang['deactivate_confirm_y_label']          = 'Da:';
$lang['deactivate_confirm_n_label']          = 'Ne:';
$lang['deactivate_submit_btn']               = 'Pošlji';
$lang['deactivate_validation_confirm_label'] = 'potrditev';
$lang['deactivate_validation_user_id_label'] = 'uporabniški ID';

// Ustvari uporabnika
$lang['create_user_heading']                           = 'Ustvari uporabnika';
$lang['create_user_subheading']                        = 'Prosimo, vnesite podatke o uporabniku.';
$lang['create_user_fname_label']                       = 'Ime:';
$lang['create_user_lname_label']                       = 'Priimek:';
$lang['create_user_company_label']                     = 'Ime podjetja:';
$lang['create_user_email_label']                       = 'E-naslov:';
$lang['create_user_phone_label']                       = 'Telefon:';
$lang['create_user_password_label']                    = 'Geslo:';
$lang['create_user_password_confirm_label']            = 'Potrdite geslo:';
$lang['create_user_submit_btn']                        = 'Ustvari uporabnika';
$lang['create_user_validation_fname_label']            = 'Ime';
$lang['create_user_validation_lname_label']            = 'Priimek';
$lang['create_user_validation_email_label']            = 'E-naslov';
$lang['create_user_validation_phone1_label']           = 'Prvi del telefonske številke';
$lang['create_user_validation_phone2_label']           = 'Drugi del telefonske številke';
$lang['create_user_validation_phone3_label']           = 'Tretji del telefonske številke';
$lang['create_user_validation_company_label']          = 'Podjetje';
$lang['create_user_validation_password_label']         = 'Geslo';
$lang['create_user_validation_password_confirm_label'] = 'Potrditev gesla';

// Spremeni uporabnika
$lang['edit_user_heading']                           = 'Spremeni uporabnika';
$lang['edit_user_subheading']                        = 'Prosimo, spodaj vnesite podatke o uporabniku.';
$lang['edit_user_fname_label']                       = 'Ime:';
$lang['edit_user_lname_label']                       = 'Priimek:';
$lang['edit_user_company_label']                     = 'Podjetje:';
$lang['edit_user_email_label']                       = 'E-naslov:';
$lang['edit_user_phone_label']                       = 'Telefon:';
$lang['edit_user_password_label']                    = 'Geslo: (če spreminjate geslo)';
$lang['edit_user_password_confirm_label']            = 'Potrdi geslo: (če spreminjate geslo)';
$lang['edit_user_groups_heading']                    = 'Član skupin';
$lang['edit_user_submit_btn']                        = 'Shrani uporabnika';
$lang['edit_user_validation_fname_label']            = 'Ime';
$lang['edit_user_validation_lname_label']            = 'Priimek';
$lang['edit_user_validation_email_label']            = 'E-naslov';
$lang['edit_user_validation_phone1_label']           = 'Prvi del telefonske številke';
$lang['edit_user_validation_phone2_label']           = 'Drugi del telefonske številke';
$lang['edit_user_validation_phone3_label']           = 'Tretji del telefonske številke';
$lang['edit_user_validation_company_label']          = 'Podjetje';
$lang['edit_user_validation_groups_label']           = 'Skupine';
$lang['edit_user_validation_password_label']         = 'Geslo';
$lang['edit_user_validation_password_confirm_label'] = 'Potrditev gesla';

// Ustvari skupino
$lang['create_group_title']                  = 'Ustvari skupino';
$lang['create_group_heading']                = 'Ustvari skupino';
$lang['create_group_subheading']             = 'Prosmo, vnesite podatke o skupini.';
$lang['create_group_name_label']             = 'Ime skupine:';
$lang['create_group_desc_label']             = 'Opis:';
$lang['create_group_submit_btn']             = 'Ustvari skupino';
$lang['create_group_validation_name_label']  = 'Ime skupine';
$lang['create_group_validation_desc_label']  = 'Opis';

// Spremeni skupino
$lang['edit_group_title']                  = 'Spremeni skupino';
$lang['edit_group_saved']                  = 'Skupina shranjena';
$lang['edit_group_heading']                = 'Spremeni skupino';
$lang['edit_group_subheading']             = 'Prosmo, vnesite podatke o skupini.';
$lang['edit_group_name_label']             = 'Ime skupine:';
$lang['edit_group_desc_label']             = 'Opis:';
$lang['edit_group_submit_btn']             = 'Shrani skupino';
$lang['edit_group_validation_name_label']  = 'Ime skupine';
$lang['edit_group_validation_desc_label']  = 'Opis';

// Spremeni geslo
$lang['change_password_heading']                               = 'Spremeni geslo';
$lang['change_password_old_password_label']                    = 'Staro geslo:';
$lang['change_password_new_password_label']                    = 'Novo geslo (vsaj %s znakov dolgo):';
$lang['change_password_new_password_confirm_label']            = 'Potrdi novo geslo:';
$lang['change_password_submit_btn']                            = 'Spremeni';
$lang['change_password_validation_old_password_label']         = 'Staro geslo';
$lang['change_password_validation_new_password_label']         = 'Novo geslo';
$lang['change_password_validation_new_password_confirm_label'] = 'Potrdi novo geslo';

// Pozabljeno geslo
$lang['forgot_password_heading']                 = 'Pozabljeno geslo';
$lang['forgot_password_subheading']              = 'Prosimo vnesite %s, da vam lahko pošljemo e-sporočilo za ponastavitev gesla.';
$lang['forgot_password_email_label']             = '%s:';
$lang['forgot_password_submit_btn']              = 'Pošlji';
$lang['forgot_password_validation_email_label']  = 'Elektronski naslov';
$lang['forgot_password_username_identity_label'] = 'Uporabniško ime';
$lang['forgot_password_email_identity_label']    = 'E-naslov';
$lang['forgot_password_email_not_found']         = 'No record of that email address.';

// Ponastavi geslo
$lang['reset_password_heading']                               = 'Spremeni geslo';
$lang['reset_password_new_password_label']                    = 'Novo geslo (vsaj %s znakov dolgo):';
$lang['reset_password_new_password_confirm_label']            = 'Potrdi novo geslo:';
$lang['reset_password_submit_btn']                            = 'Spremeni';
$lang['reset_password_validation_new_password_label']         = 'Novo geslo';
$lang['reset_password_validation_new_password_confirm_label'] = 'Potrdi novo geslo';

// Aktivacijsko sporočilo
$lang['email_activate_heading']    = 'Aktivirajte računa za %s';
$lang['email_activate_subheading'] = 'Prosimo, sledite povezavi do %s.';
$lang['email_activate_link']       = 'Aktivirajte vaš račun';

// Pozabljeno geslo sporočilo
$lang['email_forgot_password_heading']    = 'Ponastavite geslo za %s';
$lang['email_forgot_password_subheading'] = 'Prosimo, sledite povezavi do %s.';
$lang['email_forgot_password_link']       = 'Ponastavite geslo';

// Novo geslo sporočilo
$lang['email_new_password_heading']    = 'Novo geslo za %s';
$lang['email_new_password_subheading'] = 'Vaše geslo je bilo ponastavljeno v: %s';

                           er']);

		// -----------------------------------
		//  Generate the image
		// -----------------------------------
		$img_url = rtrim($img_url, '/').'/';

		if (function_exists('imagejpeg'))
		{
			$img_filename = $now.'.jpg';
			imagejpeg($im, $img_path.$img_filename);
		}
		elseif (function_exists('imagepng'))
		{
			$img_filename = $now.'.png';
			imagepng($im, $img_path.$img_filename);
		}
		else
		{
			return FALSE;
		}

		$img = '<img '.($img_id === '' ? '' : 'id="'.$img_id.'"').' src="'.$img_url.$img_filename.'" style="width: '.$img_width.'; height: '.$img_height .'; border: 0;" alt=" " />';
		ImageDestroy($im);

		return array('word' => $word, 'time' => $now, 'image' => $img, 'filename' => $img_filename);
	}
}
                                                                                                                                                                                                                                                                                                        license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

$lang['db_invalid_connection_str'] = 'Unable to determine the database settings based on the connection string you submitted.';
$lang['db_unable_to_connect'] = 'Unable to connect to your database server using the provided settings.';
$lang['db_unable_to_select'] = 'Unable to select the specified database: %s';
$lang['db_unable_to_create'] = 'Unable to create the specified database: %s';
$lang['db_invalid_query'] = 'The query you submitted is not valid.';
$lang['db_must_set_table'] = 'You must set the database table to be used with your query.';
$lang['db_must_use_set'] = 'You must use the "set" method to update an entry.';
$lang['db_must_use_index'] = 'You must specify an index to match on for batch updates.';
$lang['db_batch_missing_index'] = 'One or more rows submitted for batch updating is missing the specified index.';
$lang['db_must_use_where'] = 'Updates are not allowed unless they contain a "where" clause.';
$lang['db_del_must_use_where'] = 'Deletes are not allowed unless they contain a "where" or "like" clause.';
$lang['db_field_param_missing'] = 'To fetch fields requires the name of the table as a parameter.';
$lang['db_unsupported_function'] = 'This feature is not available for the database you are using.';
$lang['db_transaction_failure'] = 'Transaction failure: Rollback performed.';
$lang['db_unable_to_drop'] = 'Unable to drop the specified database.';
$lang['db_unsupported_feature'] = 'Unsupported feature of the database platform you are using.';
$lang['db_unsupported_compression'] = 'The file compression format you chose is not supported by your server.';
$lang['db_filepath_error'] = 'Unable to write data to the file path you have submitted.';
$lang['db_invalid_cache_path'] = 'The cache path you submitted is not valid or writable.';
$lang['db_table_name_required'] = 'A table name is required for that operation.';
$lang['db_column_name_required'] = 'A column name is required for that operation.';
$lang['db_column_definition_required'] = 'A column definition is required for that operation.';
$lang['db_unable_to_set_charset'] = 'Unable to set client connection character set: %s';
$lang['db_error_heading'] = 'A Database Error Occurred';
                                                                                                                                                                                    �PNG

   IHDR   �   d   �9^�   	pHYs     ��  7IDATx��qPW��f�]�z,7�r�Q"K�s!����N΍	Do����[�gʄ\L�e���F�����FKO7f����ň�Y�Nƅe6\��	*��l0�%������^�)�8̠� �s�����~×�����^�0��$Z��@�ɒ�P�$%�<I	5ORB͓�P�$%�<wN�}�a[�|�Na�
�ٳ�1O��� ������ �܌	��LA�^����La��"[�|�Ew�g˞#�n	t��i�(LH�Q�P�ڲ�R���n�l����&�y���A�y��J��;���r�[��PΟ����s�o��N�I�	1/�� s�~��>��릩"� ����{��-9��`ќ��w�bx�$*1� �|��ƻ�ܭ��.���3>��"�7J���� �y�W�:�1��Af����\�`��dJ�(����x�߬YÁ���`h*M ��}�>%V �y�vah�̙3}ݽ��N���EI!��R��������w���M��V8I�ѥ�n[��pt�$9��s��(���Y0� 
�c��vmi_�TYƼ�K�?��|H����'��hG
 ˖,��/��{7:_�,�[W��+�EF����=�(�O'�.d�� ��D_��Q%�Z�L��t"B�^5Ƅ�^oԧ��r�ڋ�h�F�p�.�F��f�r#�"EQCA�$)]�I�(*�⒢���̏�3��L���dg�� EQH��0��TX��t�!V���$�lq��` ��yt��Tb.��xn?�%�-�0�a2�Q���/JvFE �BZ �!��� ��$��Huz}Ѻ���\㜨��h4��u8PQ�d�o7�(�  � ��l�O'�!���������bI��.�`�U+���go,�g(�ҷ�CL���ª��u�,�0�pg���$y���p|hr�J��5eأ��& ��=DQDɲ���َj�F��f6���PW]j1��ǵ-F��O���8��[���m�,��j��t�i:H����-.E	j�:�ϣ��q �o0&�� IMӍ-lh���i+���+@Ӵ(�v��׆E�� �� G߬ғ�K`�6�4R��^u{�h/E��)�M��>���k�"#�xe���-�>�HO� ?BH��������:+J-���$I��FA]�u�\;���7�Q�&7 �ܣ���S��җ>�t�/_�da��3�}�иƷ������'�~nI��ѧ�ޙJ~R��n]Y�s���N]P����r���Ό��?��  f�����-k� ��w�奝�b����&j�m@�T��% `��-�������a��ﭶ=8Vط~���f�;��w�|����6�ժ�����Nv����O��+Ρr�2/~{�������������N��f�[0'���O\�ť\g��e�Ƽ��P2�W��h��q��63V����f^��+����m��g�!u�������ig��K�>�?��(�ahJ�N�̦l=YRh��'q` ��i��/�ȲL�$A��b���!f����R�+Na�k��m��|�+�w����$d
�?�[�ׇ�h�~?�)m�q��Wo��j��ˬt��тlbЯ\������hx��(*ګ*���rn6�������`�EV�*Hqm�p��*Ǣ7kVM�6��3�<���kڌyhw�SEF4+E���$I�"�u�(�$I����@qq�а��g˾�dPoV�>}x�$35�����u��m�U;�4���ܑ���$	��WU?I�E�e��iEQx�'����N�K;kB<�͋����{�'������m��g��TdDNG T4�TQE  ɑ9UE� H�Am�����opuL��c�-Ց��ɣ�ׄ���"��������g�C�Y�1ݓ��t�H@���?��TB EQ�$ @������ehc���j�$���k�3�R��
߬Y�w�n�c���Zׄ�g�6�-[���@EY��VV+7��U�F#I�SeY�_y�7�;Ɨ��R�Qx��W���{�Ｍ�hfZx����]��o}hR���@��%s�_3'''''g�uʭ���100�Ret	 $I"�222�5�p1���q$ḏŸZ�\'�[nc�*��� �  ȬS޾���ˏ7��6�h]% ���Su�� @D؂��ӗ��
��:U�|xB��y5��j�a�k֑�f(D�7�&���B���n�\�h�EE�4�O�ݍ�����:x���Fvò,EQ8U�ן8)�(��ӄ'�0	�gA��A�?�p�  Mn�D����+�J^:,6��V�1&����W@һ��^�W*C���{U�J�aw5 p 8l���<�c��j���-�EQ�m�h
)�|�������1���vmw���>���G�WaE�[A�C/�����R���<��ά�, @a����עƌ�Q/_�L��K� �ǋTJII�� �L�q�gw�����i���AV��)T��=-�|��w�+p������jq�=��itP������ 8�c p�F�<ϻZ<��+�;�NEirs����]��-��L��Pew���q��`���W�Wt�醍l�~����V�~��8���|5o6:ZW��}�+�Pm8�����[���Ό���P���E~��b���$�o��,k2�𖽪N�@ݺ�O�	֧�+���Μ��l`��\��u>S�0 �`n�����ڿ�o���^�F�� dff���E	���_���^�rψ$Ifff<l���o��~�_�~d�A ���2����{����`�xՌ.�1ꮺ g���],�O']��?����ࣰ���'��,Se2�A����{zzp.��N
�� =����p�܃���*�ɷ+!Θ�/n;�e�n/�ȝ��4�N�+���sqtx#�T��5���`�8N�$��p�Q�����ơ �|kcsO�d��喢ޠD
���HxO�T���|������&��ݍ��F���B&p�.#EQ� ���p.�T���n-g�#m< 4����w5�閅fi(��<^�[S��XկPR��zv�5���\%�".�� �e!��C-%f���ݻ�����h�
{H��v�H��.�l=���$s��@��Ny��	�Q�y��K��9�Z�S�7� �$��0|rN�2��m.� Cq�6G�+�q\��g��^��!=46˲�zʃ/p�x4{�xk��%u��.H��6�9]����L��,�]�����f������4$�w�{ZzG���
Gٱ,e�ZOyEi<�շrev�6��o�Tg���c�8���(��O�v���Z=x"<��:��S/�Y�$Ƈ��H���pؙm�\%��]���D�q���v��c��i ���2(��M�����$i����/�u	GZ;���t���w	n/�yNx|C��|�񣥹0�{��:Y������u���한eVEQ��i���ح�x�	��w�b�pqݎ�&7��'Nx7�4���+��X����������U	���P[�q��rw#�	�t����&v[C Ȓ��& ��|Y(냶�'�x Pu$�����2�|�t|��U	���'k\ 0�/n��@L��v��ʗ��$I8r���P�ק^n�f���`=�y�9pc�Ƕ���⥊�hc�9^�j���cEQ���>�4a4l��� ���b����V���BP��Q�Dv�i:��g#�hdґj�B�#���=�)!�%D�aI��*��D��� ��X,ю�i�D�0T3��y�g3u$��p��4m�ƑL�,��(x�Bv�D*(D�s��)9j��y&\��8,>�	�,����"�8;�����IRY�������+��ں4Q�3�,!����q�tz�3E$���\�@��Z'�%,1��Q�ϗt�ڃ H�dhqqqґj�0�Kƅڃ$�PG:���:Y�0G�t�fj��E"KH����$�>%/�HX	�*1��|��Z�7�N5M���ݡ�	�x`^��1*H��&}:���z�;���_Szܻ��붐24�����>�ijv�z��{���xq硓=��C~-=w&9(�twqǕ���1##�o���%�(*�ɰT����UOX/�|�;0�� �t��Ϛ��sB��aC�ݣ���Y���nP���7�&�� в�Ǭ������Zd{��Ͽ��P�n��C��{j��������w��o����䴫h�1z��i]P���0QYOo��r���s� �x��l_kW����}��*�;1DB������ޯ3�DX��h�|LH����I	5ORB͓�P�$%�<I	5ORB͓�P�$%�<I	5����l"�'5�    IEND�B`�                                                                                                                           unction as an argument.  See new enableTagOptions and tagOptionPrefix options.

+ Added alternate methods of passing values in via HTML.
Can now include inline values in a comment, or pass values in as a values
attribute on the tag:
<span class="sparkline"><!-- 1,2,3,4,5 --></span>
<span class="sparkline" values="1,2,3,4,5"></span>

+ bullet graphs now handle non-integer values correctly

+ Added drawNormalOnTop option to line charts to force the normal
range to be drawn over the top of the line chart's fill color

+ Detect if an element is not inserted into the DOM so that $.sparkline_display_visible()
will function correctly after it's later inserted.

+ Remove the use of the Array indexOf prototype that was added to IE to avoid
conflicts with other libraries.

+ Default settings are now exposed as $.fn.sparkline.defaults allowing
script-wide changes to be made instead of passing them to the sparkline function
on each call


1.5.1 01/March/2010

+ 1 character typo fix for IE - Thanks to Daniel Kenyon-Jones for the heads up


1.5 26/February/2010

+ Very small pie slices could fill the whole chart in IE
Thanks to Peter Doel for catching and fixing it

+ Added chartRangeClip option to force values outside of chartRangeMin/chartRangeMax
to be clipped

+ Added chartRangeMinX/chartRangeMaxX for line charts

+ Allow chart types other than line chart to be used as composites.

+ colorMap may now pass null as a colour to omit that bar from display entirely

+ colorMap may now be passed as an Array of values allowing the colour of each
bar to be specified individually, rather than mapping by value

+ Added nullColor option to bar charts to force null values to show up as a thin line

+ Performance improvements with IE


1.4.3 14/September/2009

+ Updated default pie chart colours - Thanks Liel Dulev

+ Null values can now be supplied to line and bar charts
(use 'null' as the value) - Thanks to Ed Blachman for 
testing/debugging help

+ Added colorMap option for bar charts

+ Added lineWidth option for line charts - Can be an integer or a float
(try 1.5 or 2)


1.4.2 25/April/2009

+ Fixed rendering of circular spots on line charts
for Internet Explorer 8


1.4.1 27/March/2009

+ Fixed minor off-by-1-pixel display glitch with IE

+ Improved compatibilty with jQuery 1.3 which could cause some sparklines
not to be rendered in certain situations


1.4 25/February/2009

+ Added the box plot chart type

+ Fixed a canvas rendering issue that would display some charts with
fuzzy lines

+ Fixed error in bar charts which would causes bars to be too short.

+ Couple of other minor bug fixes


1.3 25/January/2009

+ Sparklines can't be automatically displayed into hidden elements (ie. 
with display:none) - Added a $.sparkline_display_visible() function
to render any sparklines that were generated while a tag was
hidden

+ Fixed positioning issues where sparklines would be displayed a few
pixels offset from their containers in some browsers

+ Made a first attempt at IE8 support.  IE8 beta 2 seems to
have some vml related bugs though so having more than one sparkline
on a line doesn't work correctly, nor do the markers on line charts

+ Misc other bug fixes

+ Updated the web site with a new look


1.2.1 24/November/2008

+ Pie chart bug fixes:  Divide by zero error resolved
and IE rendering issue if a pie slice is equal to 0
Thanks to Hubert Mandeville for a patch fixing both issues


1.2 - 19/November/2008

+ Fixed positioning of min/max line markers for fixed range graphs
(thanks to Stéphane Busso)

+ Fixed rendering of bar charts wit�PNG

   IHDR   �   d   �9^�   	pHYs     ��  �IDATx��w\[�����h�6BHl����6/�`�؎'�ӸN�f4i��I��$�/�+}ڧ��M�k�7M�i;���a��`���C!	��ֽ�"�!.�/��?.�|��s?:��3�#�Ϡ�`��� �gA�yς��	�=�{$��,H8�Y�p޳ �gA�y����>yJ���v�����~�Yz���k��4�,�^��}�F����e��tA�� HC�ь�RW���h ��A~�^�!������n:���zae�\��/M6��?[�?�g�  ����`8������Z ]i�����R餼h�Zeg��M�o��s�^Ud��q��ߺ\��X,�K��xϣ�%��!��\�R ��Oh4�^粑����/�J��i�{��X,C�Z���̥���?�B��\lH�����i;�o俲le^S}�U]�\aT��6ª�[eLHJMH:[t�ph����[ � ��V������4^-Ϲ�ـƌ`t���B�̉�Ӫ�!t̊t "�\�I+*�E	�F�xA�v`w���(�%���*�ī��3a��y�ȿ>'h �`xZ��m{�	-$�R�*��LO�q�c � #�� ��Y<�����jH5�AS ާ.�c	a�@& �	�ļ���'4�����^N��ó�5�rj�J�/��-{I�GE2�Zm�PO�T�̜���t6�~q������ #�? ������b�����Xh������U܎6e���M�JB4��ЂF���� ����� �z�ڗY�;��ɕsz��7Һ�Ee'�-���� ��2=_��j�q�`�!���?���((z[hh���-��w�;��?��8ٕ�Mgwd/3�	 ���ntE�'��<N�S��/! �l6mo���l����j���=���{Z��O�"6!u�"���oB��   �8�6�]�ƌ�,�;�A�"�;����5M��Ȝ�p�3of�^��*;��1/`�kKgk嶷D�I}A�Ӎ�R]�Ǭ���@��E-�7�;1~��\����*B���AE[?�D|B�,�r�Jo^U���ء�Y�g1�1�i	K�O$,���&O��r�O%�fS?/�����+k�å�\p�q�n��?�@`^f���t����hӞ���	o6�ଡ଼� ���,�gD���L��愽{��Gf�}����V�m*?�
��#R��	�����s�C`5Nh�ν����j��] �Z,�m'>1��[��4*�D��E���y��J��sY�h�e��Ƙ�/�H$��[��B�5t��F��YA�|��$�0�jv��w4N�����b<�������3��� 4  OV�r9�X�E!	�'1Q�>��5���/t���ػ1�̘#��M�='KN��餻����ȁ�}��� P�xQ�_����T�ӵ��� �eYp;�6F��4D��v*,<�t���:�v�K��ZQ������M�@Fp���Ŗ�KY��8�d2��M�p)�ck0`�O?��A5ܙE�P|�x�6Ӻ�v%���Y�B&7*X쟴uE���/m���,�7-�JI�z���]�q��in*�j�,(�#� :�i��[-�V��	����5ρ��M7��� ��������.�rVP��ˤ���.�v)�u�{ �p��i���0Z�Y[��T)��3��v��w������u����ɖ�G��y5��7 G���iE���3 8[�x���Ͼ\.Ϣ�5����ٷ�!kWд:t��@�ɞ�2��%o[��/��"���eE��I�:��S����ɻ~�i�����R�� ��N�f7?>XKg�
r͋yw�8E---7�
dR�֎�V>]��ؐ�;\��c*��Ť�EXJ���2�?�����ʢ �qx!=��M;_�JTr�<�v�׾�M�2즎h�F( �+��6{��)|4�K��j����Ύz�$"I e��7�}E�>�X�E��7l}�\��m�:u��n�N nMWɫ�b8t�B���aZ��� ��Y,����%�J�2�%DS��Co�Rw �F��l��ʁ����F������(:j��O�U^v��ə��w��Ӏ@�Uy{�o$}��� #�-������p3�j)]l:��y٪�s��j�LM#qݵ�^*u��n��r���?�i�\u�~6o�o�<}ϜX��F���[�!��t	��C�L��L	����e�Βh��*ᜩ����[�n\#� i666�&�q:�4�\&��)..^�dp����#��۷&g�<B�M�$T�}(���kwC�����C�P(
�����P����B�ѨP(���p8�N<�mI	 A��\��F�P(��C �P��ܫ���C�l�����2�ߓ�kr|?K9�ШW�����q�,n&�'u;��¼�Q�����111q�����庹�,M�u�6�W�S�}Ixf	���74Sߺ���?�C���0"*�{O�͓;�H����/� ���ҬҊHf�� @�N����Ñߵ�v]��M�4�B��ڽDk/_|`V�F2+}!�'Xzǩs�ώ:���|>Kc��op������42�Y?��)at|zt�������p����$4"D ���Ν���k��B/\.7)�՞�ob$���x�V�۽-z飙�i
�?S����<x�㍒����2B�5֖$.Z����_�s(�ඌ����HF_�p8Z����.ܿbŊ���oemp�r��ɿk��M��oB�y��P��^���*KD�&��$� /y6qQ�6��tn�v��(dGp�NY�b�19+S�Cw�y8ϰ�J��_6>4Y#W��-+�	 &P��=�8�U: M��H�#5]`Vt���^ݰ�v p:����t��>{��Ȇ�vM�&o�5r���޲i�.���9
���q�<�7+��U���U���?��@��X�"�L�u������uy����
Mɔ�EQ(���Ӵ��a5FҤ	�Mv������'��z��}4ՕWB{7�yh�>�:U�FM|@��6o�{r�<��Û��m̈́+�_|���	��H���RԞ���$)E3�_��r�3�ǜj!�F���f�w�-Y�N�ծ,�����ÅΖɞH�ms\��r�d��]���&O=P`�W��1�oO?%On[�8p�������I�F���B���I�hTK	 oJA�c�rY�"_j�y}hk�tz\J�F'��h�4-��"cY�zR���
Ih8c�'�>
��M��8�B�\�)Q��循��	-`@`�t�Zh��뮾�]�&���a|���J
�tG��m��yr�4�i	 .a-�J�:�β����Fߎ~3M,tgGtm:�~Vq��[��e<�~f]��n���ޚ+o4M���Ra+p�F|��'��@Շ_����O��Ǔ�\�8m4m�̈́�'[
 ��E��q���\���m�ֳö�Diaaa|>_��k�+��ؐ�Q�WnO��rll,�����5�+\��pIL+	��@ �/o�y?_��ޏ�ϝ=�a��sY? Q���sV�+}Ն��z}S����>�z)���tw�;���#����ܫi������N��1F��8��n:�b����i���m=�ұ�ޕ�q�F#+��#��e%/��^��ޘ�ܟI���w�Fg�jn��<���ߗ���T*{�>���O�0��I>�%,B�4���hk�����b)L�d,p��� #&��LX��~)���'�B_�*;7*����ׇj^/9�ǈyrYZ �����t�1��+]�c@��d6��O7d�� .4kDol��;�*�}!o�Kd9����PG���L�y�/z4�bXN�<&]� K�֐��3�O+�T�E��:>Yo�!h���&�D2u/dJXR|l��� ��2}xz��mN�����dRT}�t�����A�E7���S�Z6S���Q��F��#�H�}��{���7ҰP�J��p��f�z^-/9C��q�p8)�O�o�7�?+�Cq �N׮�8���#3� ��n8=�O0[�r��BN-T*��ƷÉw8�[�����T�d���{|4�5�N_������d2(�>�ISY�|�r��Y�봚�{*_^UC���4���M�w���@��'����jU��V_��N�lt*S��H��������x��>���ݶ����S���}}Ϝ�t�J��u����RS��8�yw���w��
i���W���J�S�P�ն���ؔ�e�Y#u�"䃷�?۴]���8T�f�'�T���J:���|��^�u�����?W��]���#�������SqY�s�[���ٺe������%�Y���b���3}4�ը��p�����Z�@�rI�P/x�=M$��(u�'{,�p�eh/���L�[�#�'R�cc'�|?=]�^�1�AeQQJH����I, 7������7���޹��\�$8�v�@*r%�C�)��������===Z����(��j���?P���.�m'�+}����G��?�"�3X-n\��<&b�۽����j]Q�,�_nZ�~���|�	q/�"/SZ.W޳�ޏ&�����ϫ�n.�q�п�f�R�~���-�x������5m$~�����kZ�n��W������SK�� ǽ2 Bf���\�Э�q^J����=eU�w��B�����K��������6�;����ػr&�BTt�����J�0�J"	�8�d��	6u�����-�'U�hR(-,�F� c!q�-XC%�"kmˇ�ه�mA��n��|i�������f*��yg~���l�7 ��=�m+����E��3m�xiDl�a��0!����\Cc�Bw�Vw���Y�?�Q���gS�^�����g���ŒЍ?��O? �E����Ue����a��i  �XD4�օ0���c�fE�e���eƨ_� ��l���%�D�y�.����x���55��H�8
�:�/�3���b���WO�� ��b�ғӡL�J����]:��o=�:B讜��m=&�lQf�� ���c�z��z"��ͨo\�pp�:h�8 r��� �    ������>��q� ���@`���OA��Ruv����s���h�p�#�/��t��뗿���K�O�sfy�����	Ο��8[��������Q���擮�.v�F����U�#�8�@�Q��*T(Lˉz��� s_x|P�P�����U�"O,z��0���%��6\��i,�K��C��A
��Hߟ�1�H�ٛ�<bܑ��f��U��kwɾI^���g�+�)a}u1���
8\ֿ����	��8�������b��҉����"ƹ�Ko�}{��Vg�:pO��:r0�-	��$v@:W�Ve�^���ғ���+��L��̕�+7����L������S�v����Ix����;�i/�����6䇇��hPo0��n*����U������|�g�_�6�������0n_�җ���#�hQv���:�*��������bR�c�$4��]�/FS?eP�8���B�J��	�e��*Q[w=�q��A�R'�6��xp�}u���qpv���2� �� \���`�So�tk�+�.��=���o��nJ��OI��nY�c�JB@�Kc	�U��V"(�{⇏�1�C�P&%��A��l��H(��v��/I���'�<�66S�q�B_x��l�=g�o�:�����QI[�\�G�#�-M�g��,�я���:��~�o&��!fa��p �Ho6��{�,��=�~}}}���X������R�~�xg�w7]�K��$����a�%,+�O��U�0����L�*Z�&�PSS7s��Y��Fb`�����Ǜ���eQ4o),v�\��7�&r��V��؄̴����7��+hbIݣ�}�%�j��ne/*$��z_�$D���-�������w��se�ok��[e�j�e��^��4��3�e��C8�[e�ZY���v(�^��?��h�1��	^�Pf�n��?�h�f�� �՚�w0&6~xW{������ب����� ��E���ϭ��@w�h],F���"�-Ǘ"��Vw}-�W硛cC�Y��`�2�����$����a�k����-Kl\�% ��hЛ�g�������;�<�=gΜ���3�Bꍎ��;.���q����S�+��F[���{�ǟ$����-%w��o斄��l�i:
��Y�%�1Fc�ZZr1&n������7F�m#,^ӌ��L,x璕w���\`�����U��}�T�l�`�����"��yv��N��z� 5 ]"<�5g���ω]�B��uS.��2?j���i�+�h����l�"9��d�єֶR��Z�$mS����}���ѣ:�t�	d�Z��0�2�4v����0?$����%;���[�H��#E(����^�+�HҒ��΍K�
��F �F�"Ex sP�����3�5�<hHG��Z�]���L���nE�լ��=-��JBc8�?*��Y,V�i```��OCT�#Bp�8��N?��� �ry6cG��e��pq���L�Ԕ��(�\u����R"�Q�y���ZSUJ����k�L��f^�B�m9)����r��.0�������	�=�{$��,H8�Y�p޳ �gA�yς���h�0��|�    IEND�B`�                                                                                                                                                                                                                                                 �1     t)���� t)�����P����� t)����       4              E F F E C T ~ 3 . J S �1    h X     �1     t)���� t)���������� t)����       �              E F F E C T ~ 4 . J S �1    h X     �1     t)���� t)����~&����� t)���� 0      7%              m e n u . m i n . j s �1    h X     �1     t)���� t)����~&����� t)���� 0      7%              M E N U M I ~ 1 . J S �1    p Z     �1     t)���� t)����p���� t)����       �              m o u s e . m i n . j s      �1    h X     �1     t)���� t)����p���� t)����       �              M O U S E M ~ 1 . J S �1    p `     �1     t)���� t)���������� t)����        �              p o s i t i o n . m i n . j s �1    h X     �1     t)���� t)���������� t)����        �              P O S I T I ~ 1 . J S �1    x f     �1    �`�����`�����`�����`����                        p r o g r e s s b a r . m i n . j s                                                                        �PNG

   IHDR   �   d   �9^�   	pHYs     ��    IDATx��w|չ��);��Iڦ޻d˶܍Ʀ��	����pS����HyR �@
``���{�lٖm��+�vW�{�z�?dlc����k����3sf��3�9�yf���U.g�6�*�,W%��*�e�U	/{�Jx�sU�˞�^�\��窄�=W%��*�e�U	/{�Jx�sEI�O#�E���e���$l��y��~w��;_ܸ��� ʹE�Y�̴_ �Ő�J���Vܴ�W79Ǻ�x ��f��)�h�B���u�< �'}s�D+�aR���ИϾdN���ə6q
�Z!���)K3��!򤧓�1�۵�@gرO��E%�P̴�S9�|` 8�X��q��ڽ�šM 0�,T`�L����/s��L��s%<HYL�a@��J$��/h�( �� \8�I2�x����ϴ�_<W��"eb
 PJ�ɕ2)T!�|\!�p(	��H�'�̬�_8W����1���uix�,(d ���D�/a�g��/�+BB�V����skh	Ē � �`�� �@F���S'f��/�+D�Q������� 0�RP�A��x0 A�㠠y:���i���	�`x
�@FA$裰�A�J�H��z���j^�\հ>�?�V1\	�B  �T��4� bǉR�cۥ��c�%!���1!�(�3�K �g��/�+EB u��J�D�R}_L0I�AZr.��$� )W��C���Ǥ�ì);��"PsY�8��.��F�"�d���q�Q���I%�K*G!`Bl���0`9 ��&�
�� O�x3��"�@���Ԕ��� ����LJ�Z.�g���hf�I��y���h�Ĩ�;����P `�ˢm���&9��1v��p*%1۝@�"� �$�$���W_��)T��:92���̀�*��.;fԈ=kV��m~�7�oa�y(��y�����Xb0._2�ċT��Toz�q)qcKP ���3J^���.*d����#�5�s�8OM359z.��Y���H�d��s�3L��>�"3>>�PC�6$�)����9�+r)N�h�{d���on��yNGXẂ����sYE���+˥�w�Ǐ+�D�?*!���v6��o���6���G�|L���9׉�|^Oyy9��P�K%��w��ޮ�:*PRV��h�����	�G�^Rx���'򫲥Z5�=�R�)���=��ƅ��^{��%���U�B��k��Ȧ����ָR%�0�P��&�iddD������.�\L���Y2mb�`����B���Z�uh�?k�x��Ҽ�O����)݅%���?6OKB�ڹ�ԡ������׳��R,.�0y^�"���|v����G�ĳ�yµ����� �T|�^�Ĩ�n�W  A���|��2����N6�42& ����M�6������*}W�BF�|�-C�g��� �?���}�׶���+y���=V���	�-A��a�7'gK��/ J���o���9c���~
:1<�e�i�բ,�L������(c�XFGG����7�h���DP�'���S��?ĴJ�F�G��  ��(:�N�T� z"LO� ��\q��B;5�g��ޟ�x��۴J 6p<0�R�����/�������X����n
�?��k]�2���,'��k���̧c�7��N_hd�`0����uw�l-�@��T�?Ŵ�(,6����y.^j���%��:������p����{n��[�J���k� V�1�`_�Q��A;�#�QBoz����a�PD�?� :���-���y���g9W�]3<����{ �~��_�a�/���g��/��k���M��7'+�J� �n?=��������8��{�FEt8)aX�p��L��~���Y�sN|�( �ؑxD��pe������LX����t�Jg�?|����G���%��`ԉ�u��G^�˲�$S<B��"4r�S�|�n��T�� M�	W���G/���(�T:�;�8Z[�P��4�O�>[�13�4 ;v����̙3+�GN����%7q�&TǇ���
��"h����r�B��q���D����V	�� SJ�S@I@�Dh��j�fVf(]f��]��'�)= r)������NpɡW��*�*Q=Ʉ-�@�,��6%?zf���9!&��8��=.�9���=z�`mN�#2��y1�瑚3�u��'w"��nwKK����%eDQ���&ۗi\���N��*����EQ���Ƭ����������������Ak��O��QET�1G��R��9њA����, O�}����<H2�����@G?<p=̩�"��yךJ�3h�}��jYp혇��f㭾�b����<�������Ç ��Knx��c�/ j�Y�>	#q��4h(	 ��s���t�\E_cT�c!}jP(���L���H�>#�5��;�zB��ʿ=�.LK��[��	���+p��p��X���=Ҋ��\�_���㑐�� p���k�{6kpq#��`���s2����*�������]��#��LO&��˛_ʕ[���<�2�X�}b̺f͚���H$ E=�Yn���=N�0����ʳ��@(*,,T��n��|��|�"ÀC�π���Prt߻ P\5��Cj3O>{��+��G�~�/�u��=�t��X�����G�F�B�yG4F�>�  �5Ͽ�Mϋ�I��;���"Wr;��7�:�nX��ۙ�O�cI�83���ϭ֜���h$\���$1?S~2�J
bss3A�;������A����3TDrh�Z�K�.�x �5����XC�[mz�s�7�0L�n��1�-�� 6��-1�1��y��I'%|�Mɢ�DE��7֐oI�dvg�1�Bv�6�Y��|�r�)_�ߘ(�G(�'HǑq�0�UK�p��c�VD� [�nC�Y{Y��H�~V�T�Rђ5��~F ������ڭ[�NYXXDd-p�u�b�g�s�:］��7n�����g�^��H	N�}�#)(,���D��,��yFT�IH.L�&�!w��{oX�Н����c�;˾���ڰ��F6ɶ?P�E ��R�IZ�/���v����3����{��1��,�Sf�t���%z��_�~��͓
ES���i������1e�Eq9l  �bYY�7͐	�/-tbm��}�ϗ7[���7��( ��|���< .x�R�&��|�x�/Wk��8|��-%*M�F�:}��*Hnn��h4o�=N����KLb�����,�O��PI<��V�Q["~�%)�P���I5�KA,QQ��*kg������[���E��t��g ��{ؿ����gfey=����{��ߵ�{�'��&%�P����6[& ��8 `8��s�Y�R��^7��+��r�٧��z$y�@�X��o	��a��l����O_���<Ǵ�l��c**9��8����a�f˪�)�\�U{<�x<����J��U7�l9
 ����KtՃ��|z����.O�O�"s�����W�ї����4��Ḹ�J��Y<�
 0�5��ND��p� ���
��@�����yێ�;��D*�Yj=���LÙm��^W绯}eQ�ޘ�gR�~��p<J*	' �x3'W��Tk/�$����\�����p����Ti���[�}�H��i������0g�������j6�n�z���8��T�K^m�4��[��>�k�������Ģ� �<'
�B�i?���)�(��g�/$�A@�Iƃ��Ȅ�[Ã�H���?�����!
IQ ��d�R�M`��� �$7r���~�%�(j�Z�Bj�;�������p/os��%^��k1���+q��[x���ۏ:b�U�����8�������;31k�ځ��X ���R$�ڕ��~O߾1��R(%RY"�G���΋�<��.B"�-!�8Bb��u񀗐PR���hB"�tHA��)�f_�oNX/�< @OOOccc�k��y9�T�LO��`�(&����3)!A��9�w���aB�4/���y_	K�O��P����{n��D���Oǣ�P�I�ej�T�^���\����;;x�!�2@(�d����Po^]���C�����6�u'#!KEM`|�q���<�E�������'���^�z!7�;����B��l�O�k��T�$G�b�JQ�����_�R.������s�� �c߼�/;D���+��"� #���ĶgTJ���
F�S�@ת.���00,����������A�j' 87�Eh�aܶ�i�}�{ �Y2E�DW,y�嫗>c$0t\��mo�?�N��c��߿�� H(j�m�H�ΩNx}n�`윀E$��Ω��L��P!�����.��o�hS�<g��1��Jo`�����Q ���pz\.��}�˪�k{����8�m�����ydݪ:=f�a8�$[�7#$�-�љ!�I�D0�MF�i�E�"Qi.zw?:ރLzt�4�x��EI ��d��a�᭭}��8<�q����
��<W���C�f��t#F��� QF�f������4 �'N����i���|B���L��3��)���=w���XSS;�W�բ�������-&�)//��ɓ�w,)�E�����f��T.I��ÚF�
-HJ!�:��XI.��i^y֖9��OD�a&�/B2�i��PY �<}/4�c'���2DK C���k�_�U��$o����t�113�Y�;B�s*�|����X,�L& !�w�׻�,�{'���`O���^�ܹ�CSB�Z	3�c����N���4�l��Gǝ��� `�jժ����~8�ϻ���b͘��H�'����ND¯.�o��	j9D �0*9��Y�(������Y[�/�kf��zh���s �h���۠,�	LBǃ���	�7c��:��5�O�\ڱc���R]�w��N:�6�m͚5����n��ܓ-�<҉r�s�}.���}3-��g���|L�����y	e2y��Щ���&�5F�la��������q �y��ܗ��S��ʖ�X����;��'�T��ơ<�q�ȂDA�7�iEi�<�M�bn�\'�Ű91�9
"]i4�A�]�E��ЂƠ��ue��rw���4;bY�<�BJt��y,�l|v�}������R{enNo�y�h?��t��p��?r�rKfO��S�*�b��n|�W���N���;���|�D�vR��xR�TNN��b����v� �QS��(ׇ◪(j���0_������U��8��[QR#�M�ԋj����#���E�#(  �f3$b��ܒ=�Uo�]Q[!��}ń�;fju���� @qqqQQ���p:��H�b�ܥa+5�#{\"Ka]���2�������)��@)�0B�C���مM ;x/[�OTd��jێ�	����~�po���5>)!��T*u8.ą�?v��/��û{����k��\�B�#�p(��̥�� ���^��p��ݽ����u�C֐���[ ��j5�}���;����������>}z���������� @��G9�y���
2�aƩ{�b
%��W���;�xh�Mk�e�B�N�'#:��9^@i�ڎ����5��ا� J�V��ܦߝ�@ y�����H<۠ӎw��FI�j\��}�x^yK]��r�.7��1ߜ}G�a0��v���5�p0����V� �*���
�(�^�_H��Z����"�{av�,�"]+�k(z���%O��+,��:��bS�)��Q�s��"˲d�����5�^Z�+�<~҅>�����sV.����Esa�+�)�G��Thw�  �0��0��&�$'�kc�b	S�N��b�� ,��L,1�Z38���(7��^N�d���L j�GVs�~�7N}ʵ�{���& �q|��;���������%�si���������C<aa�婜_T�~���0�@�t�}I�3�dDqTyn�ń����(�EU�ޕ����䲳ᦲ�
  �U�DqfP&!X��-����u'�d%]��)F� B,��C�(ȋ�~����V U��25�����Ac�#�@M� � �֞Bx����SSc��* (���4u%�e�|�f����a�#��ڃ�Bcf/J�?v�!���l6gLU�8Uf�B�1��kH���- ��3���;L�Z�n�����#%b�����h�c�"]bnplܶgoH̼F��<���@&5f�y�.�$���c02f6b�*��"�x7����gf,R��g�������"�7�:+%�� 4}զͶ�)�p���ˑҤ� �j*��� ���8$�jY�V��?��W8� L�B3�f2��*�:U
ܥ3�͋n鲓 c��+���v4���S#�����᭿���SA]$$n=2�uX�������f�lI ��yן=�5݁�4��	YW�*sQ�/�ªy��W�T"DY_ �9Q�˻��'�u�鱃�5���C&]6�:]��`��S�MS��
I)��� ���<;�LYNp����-'Y�E ��5-��2U)�S%!K<�ȿ�_$I���� F�4�@����{��Ox4ξ�g�W=��p���U���dO&J�Ǟ��Sdl����g�K�V�9E����ń�8�F/zt�)������foK@*ݴ�!�L��������8���ؑ}�d�p�McM���w�MS�C��V��v��/L����Z�M?s)ﵹ.<��Ҍ�,# 0q�^M ˉ�o��!>�ط�إ�_S5����\��'�" (�����t�AV��<sb�Z�)Z��u���_�'Ri��aE���iZ���{zIV"*����*�g3+B1�<0� z��߷��H�߁e�|��<q~�a�^�G�Jɞq��@�[��eS|�&М�]�.|�>t��]��_���O�a$Z��)���6� �Zj���~x+MKZ�ꏔ��Rg�O1����
ܰ,<~����k�M�X��6*ֽ�NEѸ��Α��A
 �0�������Lf�F��18�e�;voyY&Sԯ���a���g�;���]�䒛�q���>;N�f�sM�\"����5�g��i�A噠Ȃ!b#H�����?�/�q^7�Z�˚�N"�CQ�TdA9��1>���.p:��uWZ� �F)�Twuw�Yz����b/U�B�q�`�� ׼�I���~�9�üaQ�T����]��~d�N]5Oe�-����"I��nI]}c�  =�G�+��6�#�4���b}-y�|�?�sl]j�,���i�Y��,���ӣ����'j��(K$�S�4�Li��)�ң�w�H� �1�톟�1�6X����ͣ�0O%�kK���ae����:;$2�=?]u	
Iڤ����1?1{�"��Q����Si��ZLE���gV�9ឺ��J(�H��v��#�܈_�Hr"B5yHBb����wҋL�rI�S$��O,|�ǷȐ�hUvi�a~���zv��Nj���e�Z��z�:��G���2 �3F��uFȽ>��i�04G|�H��3LM1����߮w�:���̪��I���&쿺�	q����P����_W�k��G&���42K�iU{@ �4��tskF�:^@6��� C�29Q:86�iQS��c< �?zY�I
g��  !aT��g?.�Ȯ,�����,�
����<���1Q��{6�;�X7�swqwG��`,�A��{yܫ�1�K�$C�45���dAu!���HB��\4�̙`�CϘ<�~�����<��c�A]�M.u>�>�"�J�`}������·;܍��g�}f�
�Ҋ�uug�.�ο���LE�DwH �bX�T�h�xX	 ��^��OmZ�t瑖fK0f���ؚ7�OP:���磑���_���
� O��:��1���*��w����Ы���;�Z�jT�!2S�+����=͛���4f` ��QF��b��Q�(-!Ѱ��滷�;Q/
�K��߈'G���zFi;�|�C
eA�  _IDAT
��޻+��w�(�;iA���w/�U�����`;>Z `��c�|�h�)4�+�5L�+l�iMȟ�ܙhR`>����O09;����_�����( �"$(��{�p}��g�8N��o��P��8]q�C��ъ{�J�J�D��l|��pHi��ƺ=GFk1���^?�<�Dʬ�s��ڙ�߲�����>C[KP?�1^������J�9A��^m�.?#O���{����_z�ۢ(o��,��:�Z �����hɴF/=1�ի H&�A  Ld�C���m.�:�06���0�< +���  *�غb1����6ɭ�����c���&y�_��׽tL���q}�+�ͩ;-g�^�_S���7߭��_�p�]Ǵ��"!�g�+��U?'��i��\(�� `p����N�����N��斅P��<8	" �@�J� C�;�mbj
á�ʴ��jm[��s&�� �A^����O,��5Yo�bX����$����Fk��?S��z �l;�Q`ȥ ��գ5!���B6�P���/�"�@g��B:}��Om��fR�ɓJ$��^>Ak��dYyG��Ū[Ύ��O%��DGv:n �p�n��D><�Q� ���:�:����Q��^�(ľJ��x�;����ؐyY�`�H@&I'��Buo"��̙�Z�>	1���C[��w��47`�A���$�Jy*���◴���~��ү�<�faқ%e(X�㛋��@B5��A���d��#6-.IK���q����;_*� ���!7�g~�UΣ�-~,-��>�x�{&�{Ng����C�޻��O*t�5�}]ͩH� �D;ң~aOc���~�.�
��hL�����nX�  P�]ům@(����9M;�I�R�X���pm� Fxƥ��R2]UB�ķ���YZ)�����l�GŀX � p]�ֻ矹���h(��.)>;����-��0.ղ�.���60��F�� Ix��/�*:��4�)`�%i.I9^�V�/��ڂ�ʒ$�����)~n��t�~␵V*ᒼ�������Zv�� ��S5�Ў�V�O��M�!.E�u�T��4/�1R���IUK�����??� ���i� D�ks_�~�3K+ ����y�Q /���p�@��d�l�՘d�m�U����!���<oԦ��lm��������nM�<L�`��ɏm""�H�_Ժ+�(�/�01BN� qnC
q#x�H����S��Ӄ�_W_�ɿ���s�'���6�DSaVXbT�XxE��A@8;���A�!�9�����&� ���  �|hn��*��1{@���
,z���P>=��SI�{�^mV�1��˞�\x.Gj@I�X���� ���^rZs�F&'�����P�,��f�ٺI �W���d_�8�Ͻ��������8/`ΐ�TZ}Y]v�w%޵,%���b����� ��uܚ� @����Ǿ�<H�%x����vh�/�;���n�D8�"q��Y���j��+�7�3EL����9�D�3�Aq�/�O�oN��W��^�k�
E6�j^����ׄx�'y��~����=�[�-�ge��vi�Ƴ1 ����@F�����`w�NMt�*f��~���&�����R�&a��CN��`q����� "���}��8�#��zo_�+���Yx�:����\���xTO+L��v�m^�|�����Io#C����r��O�{�fLB ���w4{�d��z>����P<t����sT�3�T&M�))0�h7�XZD,�ˇ=�]��p�"= ?�v�߻���[��5�u��5�T�.��貣4�n]�׾2W����~�� /3��Φõv��N?~�زߚ>\���8�A�^F�dR8/��4ԟ�PӍ:�+��%°����,�ǈBdGJ�Ld�~Wxf>)�_W�w��u�Lo��P$G:�sǣg����W"~�95MWjhF@�
�ɐe�@�a#	�K��Q��H$�1@N`KT᯴_{Է`t<�`�]��������'�no�;c�l�eȚ����,��p{�Zf�ˎ'�V�F�#	G�K	b�\)�3����5�䗆�~]�0t���cPNb�d���m�-&;�1OgJ�����ڿpfFB�J���ց���M���p�Sb}f�wŽb�}�	[J�MR\�cF)��FD/:e���p �
��|�2z
��;�����ŋ�N=��^_�ڑ�(�]�,�NY�ۭk�����}Wl�;��T?/��c�-�,�7G+:R<BP��JT�BB��e�Wk'Tc�e��?��evG��;���Nb/�����)._�f�-���b0!���c&�E��9��&����
|�A�"+;�4z��.����-�o�G)�# �^rI���AZ��{CM �Z�b���+F�&��h���I�d�r�넪v �(�Ƚ�T���gR�~1_��/����\�O��t���.<���,�[$�D#��H�y`>�V�?۸
��Qx�Ǚ�Ǔ\�NZ����F=	2�! Б�F)��8H��q/ï2)�1�4��3F	1��l�0�?�.��������.	?���u�M2��{+M�����+��%~F�XJ@9rROOt��^�!#����'������\	�S�0r{���+��,)����4�??\dPl���1�~3\cQ�"4�e�O��,��
���Vx9�A9x��U'O)H $�%x������m���O���i
`NW����O� ��8 0 �"ES )�b���<W��~He
�)0̴%���vK��U	/{�Jx�sU�˞�^�\��窄�=W%��*�e�U	/{�Jx�sU�˞�^��?A���S�    IEND�B`�                                                                       �<a class="reference external" href="http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd">http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd</a>”&gt;</td>
</tr>
<tr class="row-even"><td>SVG 1.1 Tiny</td>
<td>svg11-tiny</td>
<td>&lt;!DOCTYPE svg PUBLIC “-//W3C//DTD SVG 1.1 Tiny//EN” “<a class="reference external" href="http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-tiny.dtd">http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-tiny.dtd</a>”&gt;</td>
</tr>
<tr class="row-odd"><td>XHTML+MathML+SVG (XHTML host)</td>
<td>xhtml-math-svg-xh</td>
<td>&lt;!DOCTYPE html PUBLIC “-//W3C//DTD XHTML 1.1 plus MathML 2.0 plus SVG 1.1//EN” “<a class="reference external" href="http://www.w3.org/2002/04/xhtml-math-svg/xhtml-math-svg.dtd">http://www.w3.org/2002/04/xhtml-math-svg/xhtml-math-svg.dtd</a>”&gt;</td>
</tr>
<tr class="row-even"><td>XHTML+MathML+SVG (SVG host)</td>
<td>xhtml-math-svg-sh</td>
<td>&lt;!DOCTYPE svg:svg PUBLIC “-//W3C//DTD XHTML 1.1 plus MathML 2.0 plus SVG 1.1//EN” “http://www.w3.org/2�PNG

   IHDR   �   d   �9^�   	pHYs     ��    IDATx��w|��ǟ��ٚ�-i��{B�C�UAP�XP���U�TTQ�R�PCMH�4Bz��Mv������H.nQ�K����#�왙�s�o�s�s*�o�]��NG�.7�]	���z=w%�z�J��ܕ��+��ø��00���D���3��%�kLV���M]" �Y�eջܘˍ�<��ZEC��N����p�^�s&�k3b:3b��"��5�|���7(%�#�v%�i�}f�ȕ��}G$�������V5�_��Ar�C������{��'�j�;9���U
��1Az��T�|y����1D�r��G�[z*1L����ܖ��}tJه��~.#�lc��u(�A��� ��q���B����蔲��6v�F%�n_s��Ez ?|��8��s;S|���rxb[j�&%R���3����ʼT��Ḙ�C�[r�j��j�-�k��PjZV=E�oN?Y�"��؎Qɭ2�E( �:�vf��R�>{樐�,�S��Ð����x����ޝ���d?�elZ���?�������Q^�%�Q݁r����͡�@b뉏v\{A"& \ (
�}4���
 .�-�;�;�'K� ����Ze|Ho�]p]�/���wC�{0PnNך��)�gw�|�O�l��U���A���2ۘ�2���D.x�`a�Lj{q^AU���EV�"�T�t��ې=�[ !�R�,�O��i��>u�Z�fzB{b�\lS��r�Uo��} 002w�O|� ��}�� ���n��&	ߡ��~ny�/ 8] `5kD��
���u�v��6+mN T��� .�����7J��X �Dqp�� �n��C�խ�Zp o�0�Ý�>{����Ӳ����5O�l��� �D.XR�!��ܻyn����^x��s  Y�O�[��|!'/l���{J�崄}�~ 0)���ʯ��/��$A��?�5>��lg�5��hmP�ڵv�¿O��X�u��H{?�ׄ E! @�mn�kP�{jC6�P$�O��������O� ����ǉ3H �;��1�� �� Z4��`�Qof � f���>�·��tO��K�7���[ �S� `��
`Db��.���B��� ��%�9'd4��n(�!P � 00��Aڐ$r�BHݿ��SR\��gx]\��J����C�:(
*�d�J# x���7>��˧(D!��Q����$�X�8���� ��@= ���\ ��%\�~<��P���zߨj����ٯ���  �j�0���r/
��L$�K��&�k� ��}���.oޛ��B��s$��q
����4w�d"[���c��.��%��#)d�����.%B [�/�T>(�K.�� H %���6�3{�������G�;�v���>�%}BFc��x�ɷ��w	��E#H��<v'#6X$7k��mZ� �ӕ��ش2�����$ �8���ܑ�N �Q�m���&HdKNbs����/�U�[A�R_=w��)���c�K���|q�( �v���@}��k\�{Trkq��f��܂ޙ��	�y�a���c��Ձ״ILV}õE����������ӛ�/ynh�8= 0qb�S������[�7��TTc�(=������]IQȚ��)
�3$���J�_��������C�1��	 K��=5��[ϛ���n! �|�  �9g����d��* X�#sɺ�ߖ5���K�M�I���L�L���?y��ɽ�3�/�����@Y8�틇8L�Ձ �I��8�Qn��9����K��r����n\5� �_u�P�J
�@i�|߹ �[4q}d���V�[<sX]zT���������*�3�X�1z^ hܜ��~~#�d�1'e6~��d�Z����ߑ	 t]H���~e��n��� M��r  Ȋ� Id����ˍ��SS�4 ���S^�<bKN�{?e�r��z ��iR���G��^���5n�S����S�4��Vξ������;"E!�L.���ތ��gF��]r�3X�5m�ViU���E�/k��f���}�6�3X�t��j��������Wf}�xnR���Y��{���)���vdL�l�оe����6��\ �[A؋_� #�d�D�f���9(��de�L���Jj���Wi� �ôpM��ٗ
*� ���i	1�B�bgnؓ���3����� @��9��ؚ�E��O�v�i��E�ṡt�I!=��F�dIP�c�IH�C�m��_5'w���Imt�h3sX]��gϙ��^�D�kF��;�����|�ha�5F��b �Bb���10��' �u�ެ!]0���W[�eWFꯋm4 �=�)�Z h�-z{�ȕ�v��&I$=�����t�����}���o�s�&c���(p{�k�����`Ɂ�pmo�9����i	#��8Q�u3��i�
���ju��>p��5u	 Pn��A\m��� �n���x)Dꕅ�}���CN��_u]5�~BBh�����h���q P�*Y�ɸ��-�}g#o&2�
������~8���G��Olˈ��v'#�0,=�{���%u�ߛ|d�.M .�*`xb�޳� 06� �p���f�;K����}g%$)d�˳��}i���~�B�� 6'�f�V-�b��e�G�`����<��ۺX��X�z��L6��G��ƽ)˦�����?�����
8Ud���M/1YYB=>��$��OG�U����z�؝k� ��8F�o��ܚ�&�P���F�O����6ۘ��-��|�`���!��*��w�нn�.�����m=���) p��қ���?�X�������vy0鴕;���pkZ�$���/��� _>w$V�ۢ~$����Z�$��b=�g0Y�mZA������g�����QO~:�/�Uڝxg�E����o=OQ�������E��pMbX��<WPR���z��~�ey��,7XYt�(#g��Q������
����p�t1�[O�Mq���2r��Ey.6!��Wh� ~;�ԧ�;S�0�(�adR�6�0 X8�q�	��r3 T���4�B��Ɛ �u�s߱�����������Q�ӛkZ�N7��)�2�atr[b��ݙk��dB�R�*���N�8is���=Fn����i-nZ�.��I�Y�R����u�OrX���ǐ��R��j�iQ�|�a���V�oH��f�#Ӣ4=oXB{���K�3-���s_�RQ�"�SxY]�"��%O���%�wdM�Vp�Z�tab�A ;��LY ���F�Jb	��k��<�ۃ�������jmA���r���=���~�~6Vob����E�IB&N�ℐ�j��Mm�\2�M!�V��b�{����v���v��ew2�+ �=؞�3�ֳ���r7��E��d��N����Z5�{�N�����E�Ɛ���=o�R�{�����>3��{�t|M��rs�n1���`�Z�Rb�~<�ha)���C:$#��r����� �k�=|�K��؝��� ��v'��)�:��b(���j���G� �7qF$�]i��5r��)s��Ȧ.Ѩ�6������'\�9q�Q3c;�ؗ��'�i���=u��T��d���n��ʶ9p����Y�.��+��p��Z_���$tF���`��/g�_]�{P��ku0O�}w8!�Ϡ�Z9,�����%�9$�+M;3Pn~𝩯o��`�>�ы!�r��� ��jw��f�����wn@t��q��.�PJ.�r�n��c��igy�к�(� ң�ϕ�o=��7ep�ӳ/V���ƪ����vz���V;sŽE�=|��. �l����gX�Z�T`�s&�s�"������M�}`L���u+��U
 �:~]�8�<�|�_��w�Z�ԙ8L��n�K�(��+�UִJ�>���V��3q�W�Ӄynfu�*�%=�;)\۪V��O6����kbFcM�ttJ�ߗ�y��1>\wQ���1UnC*�+�6���q�(es2*�er���v��9}f���!)$��<.���{�k�%=O��Q�ayXLg�˦�<=��C�q!��:��+rO���&N��d���t�!�!�yb�O)�>��٣ێ�%��/Rk�x+�)��v� ���1���Uw��W)���6'�4rX��i�Z����ؙJ��j�]��$�,7���1j �\s�#�/�s��{����|uQ�C�N��l��'ҝs�-!��Qc�{�N+�6'a����q��i��������4}�-��z�KK!�����i�
�U�B�]�֢3q�,wU���r�pB"pX��+��&�7w��_��g��~���|�����>�rc���k��+!'�v�.�����&Y�����U���*��sGW��̂
���f����h\t�~�� ��B���$lNF���7XX*���S��!
�7�p\�c�Ό��\D�he5w�Cz��D@\p���H흰j�Rb����q���A����yWD@����h|���g1=_<{乹z����S#�1�l�ῼ���Ķ��u���Th��K��j�20jpl' D�b�\d�:�!q�"���q\~2K��a��c+g]r�omڭ���:����Imw:�;�9cw�Ǌ��N|��j�ؖ��/3?���iC:E
�m�z�BJ�~R됸��ժQ)mR��PaXt�^�s�Fjb[��A(.�$7������M22�-9\� �w%`ꐆ��Y�@�	g�M2����URX��g�}�WB��m��Im�� �pWƣS��\w�Zһ%'��^~�Q�tzYflWfl�����y�K.���C�6'.亢������M��X�L_�=*H����tK��'��V�� ��������u'�ձ��7�5ZX��m�J�3�C��v{����V�hBŽ#k�nF�� �;�6�Bb�~,�\�w.r��i-r�A�Cbf��(J�xθ`��Δ	mM2 $Hn�~2KY�|jVCD@ x4�<����l�'@nY�y�슆�ڇ�rK���)к���~=ަ�K�������i��w���MVvZs��<�T`�l�2q�lc&��LjK�1YYer�O��^�������������)�PR�0ѫ>,v��� _3��9r1��Y��	�T�mj����n��9��gf�^w����C	�~������B���<�����͡���V}�7��'�T����4��\dV�e����O�=�z��J���M2g�L�A�w�b�:���Ju�Z%�9�Ӛ���z
 �B�ы�uא�%�8��;�P�c�'e6Zḻi-i����Ia=��K��ֵI|�#�ۆ'v�Ko�;�ʇ�Ί�Ȋ�
����HR�Lho��[~2��  2�}plg���g���fy��D�����'�i�W���'K���w4v�^Yx�T�z�w��R�rc�Û��8�l��g��~,�C���"�cq)�Z�uϰ�����g�G�4�^{ ����U�,��q��i�����8�XL�� 6=wd��u�@t��ly@T�>��(7i��P�� ���4��2׵�
�6'���wD�\ds�1]?��q\�!�U-҆NQ���`�����{�"���ҥ�I�z��M�c��\�3�)l�����+���?E"N���4���Sdw�R���㱙����m��dO�������y����|�¡�
�N��}8�'g����ƥ7M����/k�g�5��y��GO�Ft�]6�H���/fq�$�����~<�e�'g6~�?eф+�_�o����na�Z���q�u��3@�B p�M��-�'^yq�h���c�^��;Uds�����uC��J��Ҡ�F��I����6!�٭�ݘ������8n�����*����)
�;q�A�(V�̌��ݧbtF���q�u�J$r�<�?��3@�
 8r!��VA�tCU:Pk�����(����-i~+�
�I��� �͎w����MB/���,�] �n�xH���׾��	���ߞ��9�Img���g���q���9 �2�]zj��y'��Ʀ�4�* ������χ�N6N������	V�6fn���o��{ж�ՙ�8��$�  Je�t@���0�X��B��E#�ڬ5�H�%'ၱUl��bg~�Bη9��K�¿J�V��d���>Q<~P�e{�eկ]|n�����K�����/L
��8���	����R&��+X���h���d|������y2�x���ǋ��
�ϧ����v�cq6~�D}�b���.��
��w�\���v��L�#�RX�,�j�����w��|G����i�+���ΚVI\po�������  %\���!�FT״J2b������tc�aZ
��H��@�e��zŚE�(B�3�V��c3	>����(�=w�r���0��3 0wtՎ�|y0� д(MQ�2"�o^v#<g^y`Bh�����H��	��A�[�~i~�Ld?|!4�B���!I��E�7sN�n:�B�����W4˞�{��V��@�Ӎ]n��Y~9���=n���{���Z�ˍ�zy}�x��<mOo�V�pi�17�M}t�e���U+PJ���B�A2dQ�2DeR�d"{m�4Xe�����fΰ�v����|�n��::�51���b�>}�F�37f������Z��a���y��v(�,l&�\<�����P�>���2���"�n��ت_NG�p�ۜ�/��$�nGfd`_S����P�(%6��E{�o��UR�Ȍ��M�@����D>�Q+��]	���V�@�u=<���?N
��xE��ܜ�Ɋ�<�� ��{�Ƥ���9=�0��t�����-�l�5u	B{N�������rv�ƨF�e2�B,v淇��$4v�Y8�o�B���Ǧ5�9�%������) 6�<����;��?��흡�wb�́?=��\d����l_�S��x�}�����Y��l�u���r�o��+٣�Y��l��J�oY����� ݠ�.�D�&v����;S�j�i��fS.�-�T��{����s�^aEa�K *�e���W~:�J���;?/Y7�^;Q\�`�$��K��ִJ��SJmy��
���G�a�1�����H	���(��m�1]n�PA�BbUH���������|��3���9�������O4ݐ�����%2�q�}v��O����;V�/xuQ�Bde������:偼�Ȁ>�}�<@�ǳ9$��9.��k����n���ctjK|hO���1�P?y�����F�`�l"6��RH��Z<WM��YE�*��̼ao���z���#�� f��D���$H
8,'�N�ˍY�L>�is�(Ba(ET��̍������E+Mj���#�8!�I"^��\��:�,<���b��=����z�|���f;�@^��Ҡ��J_�:X +�)^�(�������+3^�e������ι��d�k��
��	��5��� ��#N��	w,���T\KM�4� � Q�?^���S�~6vǉ�!q�j����X�������C�_�W(7�pC�`���".V�6�����̍��ܭ��;٭�=;��7�ٜ8�R$��7�6t���8^#a��m��r���r3.V��\���������ŵ���k�^���@JI�bH\��� �wه�x�hT�>�D�rc?���P���q���Gߟԩ���x�3��V��!
^��H ���Du��[����u��W9v)��������P��^���r�<����\�<:���O�m=�@/�����z�����!���8?�g�ވ7I �jT�=��+���֜���Z�w�]�Qi�xK��E��<���Q5)�ڡ	�K%�/
���?�%�M+ ������x\Y�"5R3kD��ܘO�z�~�N�uPҥ�$�es��>u���W䖨*�|;"[�ʀ �o�ڴ|�D���_��G&_~����1��C� 0"���5�u/�87��=�˦��?�  �v��P��?�T��3�zhB{Ft�Z��  �IDAT���n�z<#Vn���떟�k���n��@��9x�4��C� �����v����FN��k�L��޴f�����.��@��CI�繺�>V;>~PӒu���U�����#
*��1���N�� �#�G��RH3sXݖՇ��.��Ձ˄�%S˦i�-Qo;�ĉ�'��Gu}�7m��(
.�}y˷�}3|���;�[��K�纔k�F��{�N��t���tz5=8���`n?�[�vh�Z7/��3'e6�5�kۼ~=/k�ވˍ�M�Dc�uum�^#������Ǌ�{��{�Y�P^a�_R�vɴ����V4��S	�8^\^ǫ� ��^ԛ�|��7�=��4modr���8r1���P/����x�!�w���m���[�����F����� )���fO��
����]	���z=^V>>�x~v%A"#����k~dJY�Ҥ3r��/o������M�ל��[AX��jR�}������N���}��]^��ӿ��$T+MY��K���?�(7�L���i�1>��� ��^u8Ha�9鑇i	�l���ۣ�tt��ˇ<�p���g�zC:$�#Pn����ُ��4��u�o�$��f�DV}1���Ǽ��n����&g6F�~��b��=i2�}͢�;�����J῀B �E#����s�^`B�A��@~��º��/���w�̿�_�*y�ޢ�CP�"o8�v����W�նKV�+Ȉ�ʌ�4ZY�.З����b[Ͷ��n��㱏}0�6�f; Cb;��Ƥ���ǡ[�ncn�`H�L�|�'�j��Jj��Y�|���Ǝ]
�v4��M*�?���t�0����-?ٽw㮵� A���ܱd�^/�Ƨ�>8�ʦ)As�?�~����-/�F_Z�#3j����}��)�Z K�/նK��x���T�߱���t�OʻMx��(J�Jn��g#4}��1 04�C��}u�Za�<F��w�����k��g?��X 4w{����.��.�(���V��/�/�ḧg�����z.˽��=.�t1h�"�<�����TŨu�!=�q�ۯ��ux����X5E�[��[}(;�9;��ܑc��  �߀ �����ϋ�u*��E��=t.2PO<Y��Ό�eBn!^6�$�x \�t�陖��+�Y�xq�ⷂ�~��+�Kh����+����lFId�����*�s
B�w��Ix�����]஄��+��sWB�箄^�]	���z=��։�qYr    IEND�B`�                                                                                                                                                                                                      >&lt;</span><span class="nt">li</span><span class="p">&gt;</span>cross<span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                                        <span class="p">&lt;</span><span class="nt">li</span><span class="p">&gt;</span>angry<span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                                <span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
                        <span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                <span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
        <span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
<span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
</pre></div>
</div>
</dd></dl>

<dl class="function">
<dt id="ol">
<code class="descname">ol</code><span class="sig-paren">(</span><em>$list</em>, <em>$attributes = ''</em><span class="sig-paren">)</span><a class="headerlink" href="#ol" title="Permalink to this definition">¶</a></dt>
<dd><table class="docutils field-list" frame="void" rules="none">
<col class="field-name" />
<col class="field-body" />
<tbody valign="top">
<tr class="field-odd field"><th class="field-name">Parameters:</th><td class="field-body"><ul class="first simple">
<li><strong>$list</strong> (<em>array</em>) – List entries</li>
<li><strong>$attributes</strong> (<em>array</em>) – HTML attributes</li>
</ul>
</td>
</tr>
<tr class="field-even field"><th class="field-name">Returns:</th><td class="field-body"><p class="first">HTML-formatted ordered list</p>
</td>
</tr>
<tr class="field-odd field"><th class="field-name">Return type:</th><td class="field-body"><p class="first last">string</p>
</td>
</tr>
</tbody>
</table>
<p>Identical to <a class="reference internal" href="#ul" title="ul"><code class="xref php php-func docutils literal"><span class="pre">ul()</span></code></a>, only it produces the &lt;ol&gt; tag for
ordered lists instead of &lt;ul&gt;.</p>
</dd></dl>

<dl class="function">
<dt id="meta">
<code class="descname">meta</code><span class="sig-paren">(</span><span class="optional">[</span><em>$name = ''</em><span class="optional">[</span>, <em>$content = ''</em><span class="optional">[</span>, <em>$type = 'name'</em><span class="optional">[</span>, <em>$newline = &quot;n&quot;</em><span class="optional">]</span><span class="optional">]</span><span class="optional">]</span><span class="optional">]</span>�PNG

   IHDR   �   d   �9^�   	pHYs     ��  ,IDATx��gp\ו��}�u�	9'�$�b�(Q����ȶlK��u����L�c�S�]�㚱��x��Ȣ\�ؖ(ҒH�9�"@ � �c�^��Qŵѭů�������Ͻ��o_�U
b�o`��ʪ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�O�I�5�����Lte�%O(0	�"V���F ����+}G+	�>���� ��몋��%AC�7�36 A ��9e��K�1B̕Ov&)�ͥΰ"���B��|d��ӦD��aK��67�-���!��C%{@�YY����''�+�$�g�Ƃ�M7y鴑ҍ��{LŃ�*UgYic>6
JB���{���1M��e
 p$E	Wr#�'FNmm����"��YB�A  h$��U% �������3y�	�����r�-8
�"EH�=��%K<d` �=��k�}_��ֵ��l�V���(�kCS$B�$	�$L����i)�A�����?:l�n釸Q�KUJ�J!�W��$�4�ŜG�9Ze�$�䔊T�ۼ���`���BX�vW8J6�Sٚ�gGU:a�ξT˦�?U��M�D:���4�����  �O�7�BFLj4�*u�UY�J���v�� �(�D�e��I�[�Z9j�*j���_���m �&��#�)�V���(<	��Y\DM M��EUT3,����p�^�d9zi������/���2��0����B~�ܡ-t��'� $��׃��Y��(<	�`ߚ��#����ʰTVժy]Z�òqq��J^�.d>�fw�ܘ�L�^�\���Η�y����4�N�7�4$2�����j�[nه� ��e�g3f��O�x-��6�=��Z�H���a�, ��<4��$�A�X�H������Kc���Q��/Pڴu�Sc3�Gg�7|U���a��B[*���S��8Nt�bm�әTn:��%QM9;0����r��b(�vO����\����5�5��$T�~�_=���>׫�ƺ�ϐ��*7o)�N�"?2|����2w��~W��f3��YL�Y�2듂4�ʾp��g�#��r7 Ȓ:�fY>/���v�a�㏹}. @�lV0�7u�7��� ��������z��n�tX������R��k6�j(���!lk]�]�uM�ҩ\NV�v���U8�k�:=���@L�p�^�� �d���׮]t���i��ɳ&~
�������s �����0C �a# 	A��L` �P%%����@۷���dѽ����X�~��f�h4~��)^(�0@㶚��3׽M@��)/tL��I���^ &���X���s���k��g�l(6��펮� ��V�ΩZZ�լT�,�FRZ톝V� B��Վ��nAW/M�ҙ��kt��404�kZS? S㗤��n�nM>+H`����x���߱�fԭ���XFE�4\�"��P8��#� c<��X���0�L ���_>]���$)�lΠc}^+m��r4u�l�`F] )^��l��n����%IQ]f}��|ws���E���:���\��zN�pO0Kf�����-�,�Z��`����9W욫f�YI�0��I�����j����k��p���B�H��Ě������[�]��H�x��7~*��b� (")H��Ts�CѴ�X
��;�wN��Y�n^���D�y�c��4Y�@U�) ����rC?�ᅎ���l�tW���{7���2*��i+ϖZ�\�Je���MWf"�l�税�������eY BS��6nii������%�� ֩�f�=��@aHX���n�H��������@�k��#gHD���_m����%]:�gX��S�$��W����y�ܲr�E�:�y��L^�d���(��T��e��CS����W(#��K���{۷>s{B�C���X�>� ���N^�0�{� `r,
 �b�B�.9����q��^�@��y����4��/O,���Xw�����ЯOu�$̐��M3@���=�sIQՉ�	�
 ��$QV��Ŷ�jԍ(���kg/1�d�T �O�ƏH^KH�R�At�@pi��(�<s� GBi��4�X����Ȋ������O'3���x���f|���BB�h��N�쥪�2VM��^¼�HטՃ_i�6�E|��;J�9L��Դ8�6�H�X�#���R��8B@Q�����ʶ����~��K������b��QI�H/�kDI6�-M����0�%l0kE	��+/R��Mr����$O�����E�ű��icem���2*������ CS�� �GR/�Z(����r�¥���-���&�{�組3�$I��"w&��IN���\�k*s�9�H(;[�˪�9>4�j-s����c��S�E랉�ڜJ�2�3��jV1a�ѶJhy=@�붰�g�y��	�lz*q��w�V��Z}�j�c"���!����yzW���h��1�}�p&�U��@��|wFQ5���%��X<c��I���9�?���v~4�Z���p:��Y���(�,K�$�O}���$�/��u4��ڌ4��J4E8x.N��O1<Sn3^���|8Ii,�]�������Ꚇ*��D�Y����J���5P�TU\������qH�X �UM�(��i��n�Qfp��d4��b���ڜ$wO��Hm�.�M�;-A�?u�|�X:�y����kY����c;ɳ6���NN��%�ncfO���D"�u��K3h�{R����YF�$ �.E��"���z��R�W�ji�-���TEexfGUQZSc?z������z��s�M��P���ʠץ�Yb~�#?��T�9���`���_�]���Q���t���Y��=��ah���5I�6>O��[h*'*!#MEӹd4�㹉DZ�A4 �ӌ1�T��c�-�$I`�eU���?(]y�"U����N$B�ʣ!	B#
���^6���A+��͗��<$)�  �$ꊝ۫�m,������E��iJ	RH��Y�ٝk_�$5�h��R�U�"� :Np-��*<�`4%�]��y�&�+R� ��`6E���֎#��X�C�?�t��	��?��V���}�}c�>���7ϟ�s� �F B�v��@Sq�F�":���燦��%E �V��!��y-!�M�8z�h�۝� �����5WN\�}5I�ׁ�N��7�yn�<�Hߔ�n����iU$E�f��$+�S�gw�M�r
Ƣ(��d��ߜ���#��[�*��愜����y4[^�+fc��S���`p6��r�ɋ��h4���b;d51�آ7�Ώ/{�@�����bo��a2��HBUTdd��r�^�+����~v�z��_��T"�;��W�L�ZM��h���{Xw^W��y��\��O� `�D�p��=����r�2�Vk6��@��۫��w�}ܐ�u@]=���r�,�Pv��®�LX��?����H�Lk�^V;����� Peg������R�y7��ފ����l�i���_��J��=td�R!�&~�ˡjEk>�2�>κk�4,{/�6NvN�z�jW��g���t#�8�06s�VU#C1�g):�ȊrJՒ����I�bә��^�x�G��y��4������ы}ǂ���	^q�L���v,W2x�ӕ'�T:W��������B_bY�� ���ɴ�1�T(~�o��QD����;˽��B(��& �$ͯ�o������<�����2�k���b��	F�ߨ�S�\y�7�:�e)1��$��Q�(R������ CSmW�|�b�x`&#0z�L�IQ�I�d*+��^��[�rL(�~�.m��N'�|?a!�%DB����ں�'��ꬖ�)��Ưi������<&}�"�u�e�	�@6�iV�Y*<V"��֍����&��+_��#������iUٍ�׶�<J��1q�����&��]�y-!�v&pR�E5����21v���~a}���T�;�1<hm�,n	�F��}:��`��F�tN���xN����S�$(c��#�]S��=`7h�}���d4{9N�J��mۏ%�' y/!19<:j�o��j�}��Q���\�y�/u�B�S̴���lfO�I���қy� ��T4���$�an�����bg8��:�� Nk�D.&QWcծܹn�C{v)�:0��5E�>n��} 
yݝ�����V��7��6�i,�	p���t�d��"M�r����9��H�W�.7eR�Qs�[�d7l�3�����O��)]
��!6��R�`O_ӧ_�j��+����0��QQ�[z���敶�O"�%��?�V�o�{R� Pb �z>�2�<?o�q{��¥�Q��o� ,�Q�BsN=Tk��+��e1�2z�k7{�wf��U� ��� ��l׫g��?ܱu{3�fOm��
Z���w	3��Dͮ�}b�Y�	�)�z�?07���V��]��Rl @�Q^B��T�Rǵ�%�U��\���{7�:sq}(tY��DXRZQ��ݒk��L@C>�k/#�'�  X�q�>��t��a6��b�s0"�1���A� �P��+���=��5R��K�"<��m6�6�>�l���@Q����O����o������w	�AbU�L6����FT �b	A� Z�|�:��b2|{�yA* (�����V�I���I�Z6�Ւ�̇�n�I��0N�)������F��8:��Ϧ���{�^��8�gD-ΰhjZPH�<�q�[x!ݛ
��+%'Ŕ�L�(
L�с����tFk��,~��p����_9=�
x����i�\]�$�O����q[�-F�Ӂ�mO?05��>Đ�-�q+�����4���?>H)K�d�m{��?��L
8�5���x��t�3��i(;u������KK�o�ӊ�bo�͜%bS�̨�H�IT���gz�`�(Ar��/=��s)J��� J�4�.�D�ȋ��l�m���d!���H�Zw @»)e�)���%}��i�rt���o�/MDr�·v����N����_i�Y�9QR���h�Y��䙒JY����~  D���s� ���5�>.\���w���3W���oz�;�*ZW>�\����)�$x�K�}b��Nd�T�B\��A���`I��5"rE�@(0/Ty��{�\O����ZW��g�,�ҜJi�L���)�(^�u,�q��[gg�  X3��%.�;� )0/�4C�qr�/���.�c)ϼZ�?��%ewǛmb�cK�� W��*8�m�p�W>�`"�WwoH�y! �8[��-�@�h2#H!yޱ��5X��0o�̻V��*�����%;�	���؋#��.�~�� ��M˃!����_��IM�x�!I2�A7Z>HO�*/=��W\�轢Z�/��'�Id��wm�w�8�lh�޳gYN�3�{�Q�[�41���o�#��|�d9b-Q�x���I�?�ˀ-G�{S�,2��O���Z��)�����6/?{R���	�"�{�E��0y�}��ŧ�"}/�	�p�F�ռ��v�-��O�O���q¢P�������O����z`�wk��ȧVB̽�~��Զ����b^H ��6�:�:��/��Lb����eL
��� ���"+ t��-]fՇ3b�XdiQ,E�S;�#��C) p�ͥ6E��+F��]��M'sA����2�JR�k�T�?�a\n�7{�:�gG�Ѭ �Nc�sn���X$�`��\a�����~���X���H�Q��Oo}��G��,T�����^~r]�w�k����I�������x��G�����_�Ru�z`�/N,-mw����;g�?�7���`c����;ӢR��	A&z��;�xj_��L���͟o)#��O�0���ѯ��}o������&>w��N ����ck�f_w����� ���;+� ������w�n%+S�>�����"���:F�'�$��jGMkѻ����n{�CR�g_yg�!n�^ �N� ��j���|/��{��ZN��h���ѳ�a�g6V�Y=��!) ���R���ѻ����ۜnK��Sx����>�������c��P�_�w�婬�5��*1��"�7�n���vl~��{���� �tz �����  #G�8ڴ䷸��f ��;~v�W޹�'b9	 ��sGu��S����Zf��^��t0Y����C�D,+��~��*��z8������ 0���F�$%�� �ϟ���c����p�>��{oR�l��a|�o��u? <��[x��P����w�1f�X O@0-�6`9YM�
 ��9��U��`�&���4� ����&���M> 8:8�7�jx��\i_�=l+#!E  X�������ጬ ���8�f��{�BÑ�`8��5? �S�a�9�0@Z�S��ZrNE �-9h��6=C��{ ���ra�����S�PwT���~�@(=I����������H(� ���YyFǐ ��?t�/�h��[ѬT�2�����WM!��} �6r�s�7�4@�E�a�M͈J�?�|�U�7_��3Q� ��gg�5����  ++�X��C�tFR��{j���h�s:� ��N����vgC�s�z� <��bez�=� 4�L�?�c2��Tl�(R���L�t��y����z��v�S�Kό�~znp6}������f��k|S� �i!$(ZJT�,�`����\��-��O ��Ŀ�vE���l��=��?8!�o�g;���N-=��� $EYP4�P(#�8z[�æcn����X	�oy����*�B_N�����f�m�,�.��W��|K�Zn4<��6pO�����4E���6��PNV�;�6mO�M�m����������Jl��[77��0~�����Ђ� ������c�W:OD!	t� ~|���] =C�������ҵ��[ ��}��* �$���Qf�SJ�J�?�H`nS����� `���a�h4�b\��^��h,E$r�ၹP�"3��܁1�3�RfW4|�oZV5����b����D<Khk���n�I�ի�D�LBø�nh-�&�P���R��{U;�7M �`��"P�Xdk� f˙��{�<f��LuϬ���+&�*�s�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ�Ϫ����D6�d��    IEND�B`�                                                                                                                                                                                                                                                                                                                                                                                                      class="s1">&#39;yellow&#39;</span>
<span class="p">);</span>

<span class="nv">$attributes</span> <span class="o">=</span> <span class="k">array</span><span class="p">(</span>
        <span class="s1">&#39;class&#39;</span> <span class="o">=&gt;</span> <span class="s1">&#39;boldlist&#39;</span><span class="p">,</span>
        <span class="s1">&#39;id&#39;</span>    <span class="o">=&gt;</span> <span class="s1">&#39;mylist&#39;</span>
<span class="p">);</span>

<span class="k">echo</span> <span class="nx">ul�PNG

   IHDR   �   d   �9^�   	pHYs     ��  �IDATx��y|SU��?wK�}�v�6[�0@miE�D�������2�uQ�7�y�&�X`��� �(
�Uж龗�.i�����1M�6M�
�~�����so��9�y��'D�p��c1Z)�RQQtD�D&�GD��b�$q�^d`����b��&��$������P��������\�*�䮴�
���F�||������ &��$�b��DFB�&�rR�b�j1�*""$	A��-��i��'�K��Y�F��+yi�������ˡ�2��0*U�D�T��b�]i{G	yĨx۞�G>0�ۢM�2��J�S(��b1���J�X*U�����w�n�}	y�(\�͏��10u�N���$s���HҢT"*��HH��V($ry�R)��J��$@��_V�D|M��O`���$s�R��(�P�	���V*��wͨ��D��N��Tl��'w��(���Q���ZM�T�L�T�5�\���7'S�)�=�Lα�yS�0��^OH��Z�h4�"�2*��cF�!!�]�-Q��g�����C�%'�C�'�b2*�V��b�R��qҺ-!�M�qp>pp"{!-fA��t�@`fYR�#X�S*I�JʲJ�F$Qu��<��' u��g��S'�b���t1ØYQQ�\Nj4�R)eYV���fT�$���yl{
�=p"{!��(�*,
�Z�eI���j�f�T�K�n��'E+��1�'��ʌ����"��Oތ��Z�-2��MB��ߜȯzȉ�8�Q�6Y"!�ZJ���DJ�.��V~�$����O�UW�[��ŅTl�#�t��ncxi�@1A(���ͼ��K�RI�R�V+��hFuI���??�{�"s�X�QC�ϜN�2&�����C}}W��&mA�QT)Ø�r�\�V�j�T&�)�R�u��vI�Y�B�nU^�j�����49��0��iA�_��4�ʐ������F^rr����j��N�Ō"�B�*��(�e��HJ��Dj�T.w��C	��g���3���( /�\��kE�,���.[&�J�V/X,�XPUeU4+99��EN

PU����y�zm)A�RT1ØE"��C�dDd$t:%�Ǎ�3'd��  g��?���uu�L�� j�R�_�*�l�祭��*��e87���~݃�������׭��@:jT��C���-?:��`h|��N/���d�E�>>�g6i���`@N�������� �
�����߉�}�
�\1P(b1��Qg��!�S�?�\> ����NH����9��,_.�5+�a�Å��CK�5��m��9rN3�'>���;�j5:��|���"��ںU��ÿ��s��Kx8���98,\�eK9�("��y�\)KL� /���VE�3*7�65��S�����|��D���!���}�ht�a����ϰa�%%�lC�����F��w��.a/�meFe�t�/�\��ޕ�DܷO��E���ڵ���RX_߹��G	��>}��>+�׿J�\1������`�q�SSe11>��6 �䴌������s�)���׏�5�!��L���C_]n6sR)s�|�ŋ'O�n�TƏ�����!T.|��&.�*�ٳ�S��j08:�6����:����˗�t:/w�^�b3��lV

��sd��B!��b�o��3	�b�H�\�=q�/'O�ڿ����S���4�G"��q�������AATu�Y��XQ�8�N�XR�|�l���Æ���
�y�B_y���ikF����!7�r�;.n�޽Je�'�N.nj� 6m�Vq�r�ë׮�<x}ܸ���+m/��2�eK�������ﾫu8!3�x�L�#G�'M
z�q�h�l�X�cG��N�-�$A�Gx8bc[�����YCQ�Ѩ�\����� ��� N�2����;�\�%������|≰͛#;V3f̵�6gRR�ի��}W�{�=������>A�ȑ��c ,^��qc�C#"���:�������Y�����((@Q��[��0��{njJ
M;�i���"�n]�ԩA$I hl�.4l�^� ���خ�8sfHZ�R($ X,8x���ŹEE��EDV��>'�b�����`�!ge!/�������=��`�'|})��IKS���ii,�l�Tv��`��h��O����g�
��1ϙ�ST�|ㆹmo��x�=�))=�D�&>,����\9�K�7�`
��}��� ,Z�V{%'�wz�q"o.&�i߾}���j���K�$�qg�֗����|�eܸ������b1��C64X���/_6�<Yw�H��K�]-$������sW�`���SRd��{K����������������_�%		61h�x�ѐ�KE11>N�:���կ][�sg��ĵm�Eh��>=x�
�N'���{���o��>}�@ p�BW%|䑠C�:O���}\L��8�?߰xqn[O�-n''�)%%%�Ǐ� ��v�E�_?��^c�o�lkU�4��K�>P����	3kV��ĥ�׹�m�L\FF����uu�}��oKS���?'Ir�ȑ���9�AA�Ν��sd��\���w�!��0ĦM���zpc����/^���쩌�!��ɒ���������>�(&&F��y�H'�^/��k�HD�q���W7��׼k�֯�X�(����f|�-�ӑ��7���Æ!>�y��W�hQ��}ў����Y�B{�YSS�������P�� :����/���w��5k��~����j�����X�jk�a֭C~���BP(�h�,����u˖�^�a��+0a��l�x'r�J٤I�׉���?q�Č3�5^�҉��'�[��5�>���y��5�p��/��yy����-���믝�S��֭��>�cMM܈W"�nq��~^^�-� �����ʎ��Ȍ��������n����SZYi��.Ι����,k����;���۳�Fu���,��]��	�;�(�B�{���&���8��׍}uk�O^o�ȑ#MMM�&Mꮼ}W�
�&
Avv#�ٳC�nU�z�Ç1mݸ�@�}���#��y�r�nuo�F.��/"�!&OȽ{+M&nӦ�W[rDz���ܼw����x�Vۍͺ��{y��}���dg#!����������$�;א�����^z���۶)%@E�i�ܜO?�nk	�dRR諯�'���f�޽�'O������X߁���X���������Kx�v���њu����7n,��v�`4Z6m*�+N/c�V2�`���S ~�r��ٳ�]?x���O��ϊ[����Сhv\!r��ɓ�ɯ][�����I��1�����fn�0���;/ BU2�=�}7aOd�P���[Ӗ,�Mk΢3m�i���Y~Ȳ�z5N����H'�����_n

����~~Tm�e͚��>���0���:�)��󣪚��"�?���~��걭t_��yǎ	�=�s�;���B���!�>8�*,�/�����]�����v���_MM�T�See���㏇�9Sw����N��c���^�Ư)xoNt�HA�����ݻu}�vc�m�p.���^��@��?�Z�� tU?�����B����j��6qb+o��L�0eJ��O��4�y>�.-��B=Al�0aԱc=���?-]*
����SS�v� ��%\��=O����(�_��ؿ���eR��=: !�7&Ƨ����+����̻��tj��e����p�O��5kJN����HG���0��x/���r�"�>�h����s3L�vz�F���˒իe$���
?{�~��J������dݔg�e����M��bb|��I����7�(�L? �7�,g�r��1p�ϖ-�~68G04i�b�UDzv�~~6n�����Ю�C$EYL�����Sr�D�;��/o?n���U��u�1��l�N��|S��g��	p ����w� p�����A�nf��vi\����8~Xq��~ӧ['����	���-Sx@�vlw��&��|�~:w��҇r#�#Ǝذ���'�y���:��ł}x�/�=h� fF��n߾.?��8�7l(]�$����:&��Ψ��<I�hK뀓m��,0���ƌ	��#kk;4(��srE{�^���8�Oׅ���˟���*l��	t��<XSsq�̏._���7��I�NE����ٍ���`��h@K���������#�T�|Bk������~j���)�<��K��U��zV�i����I֮P|6s����n��ֽt8d_����}ㆥUf��Ǝ��#�m�@f��q�v��
LLt����|#^?�G��ϻW? `ƞ=�U��^��]ܛuM&����%%���*4����?^�V�B!8r$꧟�g�
IL�p!���(����ԬƆLLy
y���V]��өS'��|�t�����j��{~����r��_��z��5=���u��)��������1�21����?z|�f����޽=t�%<s���9�wN�X�aa��<4k�����駆ӧ�\�.��M�o]�?}�.7��^�0Ăa��qo��n*��t�~�WW����~��{�\�U	I�P( -kז��6o���,Mc�f���w�-uw/8 �&����=�����mm@�"�N>w.���#
(���􍎾��v��Q��U�:Yl6�/#������ߥ/6���B!��7����{۷c�WW�[�`�\�c?�X?t��H��G�t�~�з���������>j�j*��JO�Ɲ;w�?^*�vW��H8mZ��o�?��f޼СC332����x�'��B� ��II��
��a��c��܈W����@l�Oj*;vl@o��qP���;Y/�v�qʔ�ɓ�(�(-5�;Wo4r 

���,|�T*,X __df��=1�R<��mC����e�|$�[����G��r�Nث�@D߾}���.]��-I4��B���o�2���r�č�K�~�Ś
�ys�㏷g�45᫯����,����j5�C�����?,_���-W��y�UiRR�c�]��_~��Ș6m��M���LBj�uc�%"B 3��_�~��N�!>� r��.僤�U,\h�zB~H�����yF���[��PQQq����ӧt~v8���	���X0`���<pն���˖I_zI�A|s3��Z����m�ur����dIxx�>η>3qذa�
Zt��������T]m�t��b��7���66�G$rï�t���?eo�V�n1!ab޼����Ӧ���6�������?���WUU�l�.�m����3'�������4��ŋ�[�uk_�3(��4)(%E}�l=s�Lyy��q��]��jm��//oYU I�3aB`B�o�~�"��M64XJJL���ﾫ=|����z��L��x�ōvn��F��Z��+\�n$;;;==}ƌn8]�p�j���y����	�e���:\U|��p�Z����16�g�*�/UsGR]]�o߾�3g:�䀇�@@�,��~��4A "B���X!ʉl t:�O�4=�Dxu�Y��*,lr�/��W��M�d��#	�?�Ν;���ZG;^(3������{MM�ҥy�7;�n�_�owm����ދ�8��~Z�䓆�	N��7o^�@p'���Z�/;���=z��ߊC]X�uIB��)-m��%<�T��踀�ܹ�.4��C��ރ���9��>�4jܸ  K��__�`�����='~����mim�Oc#��[����XK��l����
s׬yx�b��K�/�SS���Zb���RSc#w�p�ȑ�j�ׯ�:��]�j<qB�uk��9�&�ҶY��+!�w����
,-5����C.Y��,	��\=+���z�N|���\9H���ХK�_������q���ib1s�J�ĉ�:Ġ_yEz�|áC���}���O>q\�����S��f�����Ke'VT����Ə���II)�o�ɊR���;�o7nX��fg[��H��wb�F�gԨGv�� _Й�O>��"kj��傌�z~=�6煅���b1��G�aì�?��S�f�-�g#$����L���"�۷W�zUU��G~�U0������2�gSj��Gz��������}���pʔ�]�T|mٍ�^|�����ug���IA,+��K���__��i,*j��㪎�)��������z��*��9��ɱ�����g'	a�n��nO'���}�|4I"+�1:����o���S���sqq��/.κ��V��@uu˷�؛������	h���^���l�	�x��v�ڶM9z��k�Z�I��h��s�//m�P��?D���ȦN�aW����6����^�%$�iRң�����^�� @���i�}$C��&&�����J�_5"�1˗K����ի�n5��:_��v��	F����ܳG,�����#�,]���{����z���K�����*�x�xk��uI��\�S��=h��ѣF�ϛ:aB ������y���uU�UW���6E�:��9 �����l��q���IA>h���U�D?�!��]��W�ެ�u��mV�|8��!�B�4�D\�>��i����@:{vhZ�2?��Ϗ8�J^�c.E-�^y�c��YqW�߰ E@PH���&�ӉE�Ȩ(�BAQ�}ȭK�+��ط�j֬�����$���z�w��J0� ���w���K�Ӵ�e9�,���je,+W��
�$]Y��jm�S�ꫪc4q��
��{�[�c���W����,��t�J�Ւ*�T&��j%,�Ыܥ;���l���Tw����X��@E�,�"*���LJ%%�H�z=��=�c���d([�-I�� �V��0�&U!�p2��C"�FCi4"�$R����h�jS���	CP���<�ݾ��>�P�DØe2�t�\Ei�b�4R��gY�>����%	}a\�=�����9a3+����P���P�I�Z&�+���2���=�B<���i.��f]�����$YBQf�Z-d2DE���R�<�v��#ܖ��e
��`S����tެ�"�b��(��!A�#�J�L������T��pO��8�
�R=��X�
�*�(�B��X��7+�:���f�﹅�*a.���1�B�J���4]����(~��T*�L����d��:�s	� '���x��ͬ��"�4+�P����hH�R�P*�J��$��l6'��.��V���Jx�4H���I�B�PD�T���;l��iڗ0�����x��q@1�EQe4m��4i4�LfR�i�J̲J���3W�4��¸����EW�
��.��F�����	�Ւ*��eUZ�P��&�!�=�"!S���Y��=�Ŭ�(�W��JE��R�L�V�;W�"h�v��@�of�E�r4+"#��"X��B���*����y�B��ޝ�n�?�*�ji�    IEND�B`�              an class="k">array</span><span class="p">(</span>
        <span class="s1">&#39;src&#39;</span>   <span class="o">=&gt;</span> <span class="s1">&#39;images/picture.jpg&#39;</span><span class="p">,</span>
        <span class="s1">&#39;alt&#39;</span>   <span class="o">=&gt;</span> <span class="s1">&#39;Me, demonstrating how to eat 4 slices of pizza at one time&#39;</span><span class="p">,</span>
        <span class="s1">&#39;class&#39;</span> <span class="o">=&gt;</span> <span class="s1">&#39;post_images&#39�PNG

   IHDR   �   d   �9^�   	pHYs     ��    IDATx��}w|\ՙ�sn�;w��f4�F�X�-�Un2c��%H%	ˆl��.!�K6uw�l²	!�P��ء`��6ƽ�"ٖd�6������1r#%4���i���s�s���3��s8��Lt��o�9
�z����9
�z����9
�z�����Ja�+(0��nE^��o�D�ᯁ�"?�%���q�i$�H�<������TjșEP��Ǧ3�\{�?6��7;3�����u��]\U�4���ʊ��]f,��,��G�\v�[���)ʘ0Ъ��z��Z���-����������d�D?�_���BB����a�H!�@ɴ�Vo����x���[��G�`��k�6��z	E��Gޒ�k��4я�7�l�� (a_�>�@)�m�z�⺫��O�3��}N� ����j�`ǚ�#}����b�=��g;8�)�E�#;�v��*�������i5��YU��Y��� ��<�h6���M)�3�͕�����
g7� z����7�Qr�o�~�ks ����k� nm�<�e�Ww4ھ3�HK��>}�褉l�Gn�����ڀe;ϳn�Y�������]Sk�}��"�W��ֱD$���o4�u��Bs8[��S���{�Z@���(�FF��Иh��9��D����� ���}�N�(�9'�����4��蘵�=24�<�x4�q�y6�8[��ı��������h�ǂ�-�A�ֶ1<.�3�sls�|��QXH��p$�h#Q�׻����>:a'���l�	���VpΡ�{?7=�1F�$�Y�QJ)��퓟:8Uc� x��d��ߓ�@�pm*��&ku���J��]ϐ�k4ƞ�����	Nl3?2��3�]c�`|D�vG_����So���]�����H��Gr��G�'n6��{H��Q	�	j��v�$kcU�[��z�ͣ��[�G��H�	P�gM�:C�c�P�
,��ӓz�?��j;3S�G�v��uG�,ϱ���4{Goc2�������7�n[uզrq䃋*�F.��κ�)(�m>��-lh\4m�%�I����r%T�������h��Zk�7���\.�G=�ïK4��?���ꠉ#��!�p�n) �f�U�5E��Y� ��2�WZ�����Vl�k�DQ���_��e��S�����m��}���Wk!�"G��H�g�Z�H 4)S{a����r	0 X���X(��}���&ׇ��	A��v�ֽ|t:%�G9C�����`��)_8ݻ~K��r\Ţ4�z���8nV��a��{�(�����"��(����@�5_�E͌�/=����r�?��]tA�Wb8ǭ2�����D�B��a�@���i�5�x��;����!��@�a��%��"G6��%��I���r�_�`3�h H�U.t���Z��S�١�#lp84�^nK}@A����}�J�c�`X �D�{��T�h}�3`�>�|��+
�RW4�?޳,�o���X"˙#*�H������ʉQ3�ï
;sG�U祚�W}���-%% 3�f��]U/1z��k	����ʽ�4�/
�pq��-5�n������(��P]�;+ݘd|_!��1Mp�R롗�c �[�T�u�4U%�`��_&���QGV���e	��eX$) <�޼����Q�?�f$� ��P��r��Yw;� ���tC�{Q�r����*��%FNi�Ȥ����=��#��C^�`�s�)�G�~��ٛ-\�Lb��ޗ�״N��a���ٴ����J��w��y�#���.�������[%V}��ҙ�g�>�����3���ޣ1C?ÛG�^����j�O.�φ�m�����#-�jȾ�Q�]����o\���/ηJ�5��xh =���������1�@c�+\�B����=6��c��z�������GZ(��gxL�X �j����ll������5���ԝ_}aû�h�Ի/�������M��گ��9����_n�eo�87�^Ѳa�=�1X���X�ܷ�*�����k�u�]6D(����A 6�++yoZ�z־H����uE.��q#�ަPR�YW�i��㪫�td�J��4������`�taK��C�<����_o���G7w�}���:1���� ���.\��� ����¢g�^`����<��΋���ŗ�d�b� &�=?[����@o�?0��s�*Jj,�Z$I��y�]�$=�s,�NL�	yD���,�Y3���a����r6+)67L�cV������o��Z�W�s�����u٠6��	�Ì�N(5(?���u��~�~��[������b����(�zE�  ϡ̷:��Q�쵧x^�Q!Y����S�G�0�#�E�"G S$�J2#�l&K9�K����P0�[�8B�B���\c1��������������M̉��n@��� 
��s>��t���o��p�Ͻ����uE���ꃖ��4�4.��SkR]#�8�fVn�)K�}f~x(<�G&�ሚ��B&~1FQ��h�c�^Lbe��ߩϛΦ2�����2���aw�{��)z���?��a����g(���v.�,Lq�0�j�0 ��J��RJa0(4�7������|��%����8�v�7�����k,TPQ�;����5���Z��D��.|S7�^�����g���/.����W��`lA����dך���@񺉮�aQ����A�nf�Ƿ��g�ڵb��M�e��"ʜ?���֜(�9A��NP���R��!��N�Ҿ��E�������V��7ܵ��c���"n�P�@��F{{��R_��ۭHp�Ƀa_�C4 ��g��>˧��[������P����ۧ_F8��!� P_���Q��i���o�k��}o_4�t˂g�ll���`�<��L��K���z_����Z��1�hd��b�N��`]rV诗:������9]d��,��ȉ��ȦxiOƻD����a��WU^1���6�f� �BK����'���K��7���j�r<��v�ᰃeu�H #+5c���O<���e4��K��(v����p��}뻲eu��Ra��ҽ&<��<U�mò�ɥFO�v�̚���+|dI���O������l꒖��9�ؙP����B�X�|�<ԡϜy�ƃo��UM��i�O �������	GCCK��������[G;KTr�o^0�Z�89�k����;���W؄ȑ�ek}wdl�E�]�c3�x�=S=�~���ә������s���$j-�7����mM�suα���Y����˴�6���.�=H"e�}����u�XZթ�b
�w�˚n�㉭���!�G���]�ّ�]]ߴ�U7����+����N�Wu����8Om�f�1��;4��o�5v���B��)��a��͊�������qi�h�^���H��!;�^��Yg��p쫅�H�V����e�?�cV]a�-b~ ����n�ת�/�{���.j�)��o��i'���:�DV������/t��y�vU����{��䠬�e�7�J��Q2�M�6��e���iOyDuN�u^�_��-��;���'Yz�D��p�Z�<|bcl��K�v���
�>Xd�Գ]�u����������+ݵ��'fKOMgތ��([������f�(�	 ��Į��;
ϣ��هf����y���
¨�u�������=�h��vuP�|����|�ec\�9l��@���f�x�;�T���/��*�s�+�W(?5�o:��`��{+fW��/B �K��r��"����G:]��4��K�7�Jn��h��e���mLĠP�D�<ʑ�P���S�N�f�  C���BJ	)�@@�"�Ž��$�ɯ�������Ȕ?:�i��|(C�rL���|J�0�v_�ϖl���d����U�w�@�@�@��)��ܤi?�j���QW@d�-W��Y��Ɩ�~q�o�}��V���л�w���I(�M��[����"R��r�:K��#}n�LA;j�D"|���E���]��%F�[����}��P�~��H ��\j}dNg����\Ƒ�\��A�C� �|FE &:����=�%a9:-�,4�B�(�o=����B-�p�y��%L����N��8h%��-,,(@�BP ��i$����K^�����qr:^O�钪�,UZ��Ԡd�=;P���&�L�Ńc��� h 'rtv��I%^	�%��t�AL�iׄ�<��*Դ��0��9FQ���V!����HdE�.sЖx�M���LwJ}�!	I�9�&������}��jG��AGU%-)$W3�{��q�1*(�F�� �8�G�s|h��T�1�0C(@N�d�h�j6@���b�0f�p����8��"ƿ�ڨN4�cx�����8��8�'����u��&�(�2> �O˛L�,	
o"&!hv��>h	�'���Ь'�y�1�H��ʌ���1�qT� ���  f�� �s��! (��w���I� ��F�et��y�� |{��@�6��)"�|�C-�С(Ɲ��#����Y����d9��d� *�l�i0�H��NT��(�l�T�1t� �����*��lM���O��ҺHO�7����U��[�m<���q���~��(o�[U�+Bkl��9�(��"2��(�D�d���X>@�N�� � 2��l|r�q�Cy�rlb���gsËLȰ���u-[\c[�"����n�����qEV����c���u�#�����r����v@�P��U���3;�K,f�S�6�{�C�-��B��T� Px���0�(,'	 ��2��*$!�� Lb�Jb��*���볻<�pD�����#�R�HP۰���9]�y�3�M.��a�~�_����Y�>[-�`~|�K)���3�[��=8����`YT��P�9
YSja~eg���KL#cv�o�~��r �c	0D�8ӌo/��F3�F����]�F����S|h@5��]̣+R-3��Z� (��A/_�(���V���n�c+����[�g��HQZ*�\nwW�C�V>m��e��I&�$HJ���=��ݷ*K?EgM`�9�˝�$	 TJ9^���R ��L9���,0ke� ���NN\��H��Z�܂li������z���kW-[����Uk6[Gw��h�7֭۴�<�t�Ϩ�Y��"�n�H��K�����v�L|�1�,h*'�e�M^���?�ꊴy��"�(,$Y 	Iu	�+>� `C0���!� ȑ0�� ��B���ra߲�u]L�=��5�(+)�>���Ý��nܖۀ͠x���E�_[2���KG"�B��5b$WN��9(%<��cƛ	y�Y�Ԓ�0�(�d� �tB-�gC  6�5L<���~5&���Ŭ���{4M��<ewۡd:#���Ο`��]�}#���h���ة7b�;W(fΝe2q���0�&锕7)�%[[K}}�f�V��<��BBU?� ॔"TO;� �Kft�`�x.�R�l�u0 ��H�����E ���W,�`�9.���}�9�*KK\NG8k��Y�i[,qZ��W��u��^���8^|E1QJ��ˠ�g��P�g�a��	u�FQh2�BV��β�dH���\:M9�0�\*��S��`{p,�0��iM^���q��*椱�'��UWx\N�`"8�B�a±�ν.i�g�I�x\�+��M* )$J.�7��#<���n�:F%�k������S����$�2@Ԝ�q|��y��^��f��#���`y��2LS}���m�;�+�sgMk;tD������Z�cGBc�輙Ӛ'O
�2��s ��4
�Cc2�V�xl�D�@��͞p��:1I�g@	�u*� ��Ӯ:�LV��B��Z���	D���ۿPY Ǉ�Q��t���B����lq�K/��"����8�q�_�u9O���Y-qĐ� 2���x (�& |��� �[h�$r��p���f�5�Ӯ�f0�Q�b�GXK.N�LVz�����?��n#Ù�'7����#�P�e?u��9PJ�vusg��� ,��f ģN�;��, Mg5� ��V5y�� lP�%�Qd;A
�ـ �y0�f�L*�r=΂��i��� ��/+�J��oܰ^S�����UW �[A)(a^l�Ҵ�g8���1�h� !,h�C�}�z�1RI���5N�Y &��{�������3 �as�Ͻ2����B0l&]�<P����y�]� �	�`N$�D�~r�oy=�S�L��XR��WQpXO�i����\~�S3t6��P5֐ &��J���."� `9���%�Q5�b&�NY�0��4WZa��x�
����VK$RV����g�S��_2��Gx��(JR�L��8�4��	���_o6g�q��� t�cu
��K[�_>��,P7�y�0�)�G�����������P��J`4Sa�٩�Kg٥�|G��i��9���mVill�+���G�Q����
��&I�O�2@�B%�q���9s� ��L�����B�H� *Hn� �Wc� :�d<�3�,��=�J徫]1�����-�����Is�x�8X�,������=g�Yx^`,7Na>���ڈ�R �YES�d #+��jN; �r��9����`�tF�uE=�ܬ$p8��~�y�`���F���JH#}�x��0H�L)+�*�p% P��f�H�<ܴ$���GaJD�US���z�]r�,++���p�����TO{*��j�j�D���/�#���2��-��*��f���_]]R�|ɢ����{�(5XBB���Z�s_����˲5�#�(.��,�� X�N�A'���ϑ_��%�t��-��p�#q�Ы�M ���jZB:K�#�:^}jXpBSx)�����?�8�s7����S4Ms�V��B��Ϭ�]�����4o|$]�g���D��/��2�C��q�U`#�A�,͖_�!�2� L4����t ORB��0,b��~��
O*�
��-���Ie6��b�np,���������\6}J= M�r�ǴZmW]ܰ�酆>+-a�9n��}��lF� b��3����2c�^f�C��F<F
KL�@�[�G�%��1��:�k�g���F�=��W�䢆��ι�wO_<ozUE@V�e�z^Y�֊_3�R�s�VSS�Ғ�5���e��F�7}~����(�5��&���S&c�fDE����SM'���	�B O`޿(�nF��I4�c�T	�vk|z�a�o�k���gӽ�C���[�Ŷm���r��T�a�lܶ��o�_�eYN�4J�a�L6�r�0���MY8yo���;X�����^��q�3����jSђ��S ٔɈ����,q�f�Wf��U;@'��Fo�^��>�=\@���rI47P�����.�a���➡� ���\�5���ʂ�zzk�X��/lٴc��Ȩ��.U��T���l�P$��d &�K�ԭ.��u�?�a�3��Jm��ֶ�u%&���� J�/�0������;�f������Lp������SJr���u��JY�Z{��P�#�wN��ۢ�m2so�K���?�Uo��z���m��\�@J-��F�ƺz�ut�?���ӗ��_�v�yN��΁[~�J�������P�3"����k�i� B����g&��<olȪ f1#��S�^)~�_e�^}���R�g��Zx��d��<�c;^���j/��8�d2	�i�жx��@W�e�=�w-Y��̬K?���}j{CIziݳ����њ-�6n?5�3cꔆ���8��뼡/���g�V��<�h������k��薯�]�x,#+������fƵ�Ԧ���$�ޗ#*�����=o�m�&�B�]_�˫Ν���r`���k_�m�/����C�ʧ_�xJf����i���7�lPKg��ϿڞH��,w����k6���r�E��;^�ǚ��bu]_������S[�z�hd�gߖ�����3�����y�7V����W����m��ī�80iƜc�}�E��7Le��L�G�C/m��K'U֔:�D���L  �IDATNiyS<S�0�z����#�����mG �.�a���:!�a����@��n'���z��~��PC�E�A'26�`
U�-�`���r�"�H0��l��A��r5GXkݔK�x~��n@,Mַ����v7��[��R����є��_���Pl<��ٲ�6�&s�F�===ccc�X����̍8��v݆=����������ݺ�]g�,�����chh�λ:n�q҅6 � $$�Ҧ����Mc$~�Sߘ]���#�7�>z峛NK��e��А�('������Ƒ��`�m����^;���c��S��3s�p��!��iY�W�:ț�,�!�B@@�!��E�Dbhh������4�t�3t�G
���Y�C_����������{x�����#�P��������E�xp%OA4M� ������7_3��p8��=�`�������KKK|�?�mo?C��U�w}��R��եi���
Q����Qx�Oq���2����p���D2����Xlxx���kll̝}c����M�XP���  ����Z:��a�ma����8�aHOO�E�슾+yK�?�_��> �����z�^��������wn�ӟ�ȟ�|e�ɪg�9���*��UUU�|>��W�w�_u��f(ߺ��a5Y��P8������o��|�B I�Q���U�[^����X~��C)E<����ϐ�jkk[�pa��K�<�Ʀ��o:��m4���8�qHו�έ�h~��v�ܱ|�r�a~����J�K95�������.]d�Y�.�A_ؤ��)&<.<,Q����Xg�1f��;�����Nu|����������n޼���������'���`(���U��.�l�K��-%ž�����ڗ^zi��ݷ�~�O�Ӌ/���o>!SU�����ٓ�ΐ�1��M0��H���G^M6锏H�3� !���������֓?��׷hѢ455�^������;�<|�0�O+���Zv~C|���� >�3������7k֬���v�]�$Q_x�Hd<0x}펖k��W�� �Z#�=�C^Q�@��+���%7�r՛�eY)--]�vm?�0�T����b����644tww���{<��زe�ʕ+	!�����={�������Ϛ5�����+_ټ���^��5���X�=�Go��nOfݞ�U��o�|Ɣ�Z��	 �L�|>����a�g����F��իWoݺUU�iӦ%	����zg�n�����W�����z������R��dn����M�4�c�����;��[n��G?�QCCÔ)S2�Lkk���P(��y`h��u�{G=i;g=����H���2�*�X8�1q,U5CU��p�g0�BC~����8���Qa�:����dW��pv�!�s���g=�Qx���g=�Qx���g=�W[	*3J�    IEND�B`�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            2"><a class="reference internal" href="path_helper.html">Path Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="security_helper.html">Security Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="smiley_helper.html">Smiley Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="string_helper.html">String Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="text_helper.html">Text Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="typography_helper.html">Typography Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="url_helper.html">URL Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="xml_helper.html">XML Helper</a></li>
</ul>
</li>
</ul>

          
        
      </div>
      &nbsp;
    </nav>

    <section data-toggle="wy-nav-shift" class="wy-nav-content-wrap">

      
      <nav class="wy-nav-top" role="navigation" aria-label="top navigation">
        <i data-toggle="wy-nav-top" class="fa fa-bars"></i>
        <a href="../index.html">CodeIgniter</a>
      </nav>


      
      <div class="wy-nav-content">
        <div class="rst-content">
          <div role="navigation" aria-label="breadcrumbs navigation">
  <ul class="wy-breadcrumbs">
    <li><a href="../index.html">Docs</a> &raquo;</li>
      
        <li><a href="index.html">Helpers</a> &raquo;</li>
      
    <li>HTML Helper</li>
    <li class="wy-breadcrumbs-aside">
      
    </li>
    <div style="float:right;margin-left:5px;" id="closeMe">
      <img title="Classic Layout" alt="classic layout" src="data:image/gif;base64,R0lGODlhFAAUAJEAAAAAADMzM////wAAACH5BAUUAAIALAAAAAAUABQAAAImlI+py+0PU5gRBRDM3DxbWoXis42X13USOLauUIqnlsaH/eY6UwAAOw==" />
    </div>
  </ul>
  <hr/>
</div>
          <div role="main" class="document">
            
  <div class="section" id="html-helper">
<h1>HTML Helper<a class="headerlink" href="#html-helper" title="Permalink to this headline">¶</a></h1>
<p>The HTML Helper file �PNG

   IHDR   �   d   �9^�   	pHYs     ��  ^IDATx��yxe�ǿu��>rw�&	!			�pa�V\G�a���c�a�q�g|f�y�u�yf]E��qtw��QTt��r��t�N���ꮮ�w� �5�Oa}�ꮮ_U��So��}�*��}j����_M����M��a�y{D�" (4P�����dI8k��M�[�1ad���g�a�1`��Im�$>E�y%K�"��YuB���Ĺ�+�� g:gEZ
Oӝ���gq!m��P�P�������� @����N�q}OAU�;w��� yS!hސ^lkt	��M���Py�YĆ�u	�+����!��הn]S�Ǎv
I!:ut%%Q�~�z��Ό�Y��|Q	�ڽ�9�?�[O�Ô���E��vV����+K=%tS�p�C�@� @�tv���O�gI89���HƕŮ�֠�?���8�1��\X��u�!�*v�YIyf���t�Q�r�9����xSoq
^�5�N�)����~��F��ҩ{�CG��;[CM��}%ﺹ�ɢ�R� �_���#��(��!�~�u�Ъg�,2����jƮH��}��^Z��rt{�G��fL0�'�k�k�I�︾������7ғ��e�s�g30NBH( 8z���%�PԒr�n'\�D�;vk�\������O�:M<]�0=�)2�V]+�?�ȶn���掁�[�ÊR�?OI�v?�оz�����Đ_�����Tw�f�kŌ�i�֦@M���,�:���羟_�k<�)��,z�+� �麟��{���3��Rj$,썤'��L3��{�=�����Y[����1P9��c�D�	}4�H�eÌs����t��r�\e;��c�����%��O�\sK ���@�~���,l����em@(.��ݾ��)��>�?0/sj�����*y$"rFj�M;{؟4.��~��Ð��r�NEǍ� �P�)I�٦��,zfoW���=�?����n�[G|˦��ܒK(��W;�ڕb���D��̲9o�༩�~q�# �����L���rk�������1�Pf=⌦qB���a���r�J�@+���ԁM7������>p��Wd�M�M�2��طNʏ7�����E&@QԊ��k7�!rV���⦕U�����mS����Ë���N�b�Q��~y'U6�Y^Ռѩ8�Ad���_Z������-t����¤N�����W�X;��}��Ҭ�V/zi����f�?���y��q�3�d�g�_^o�"HRȪ�}�t�/�e��)Q��+��v�}��N����tgAQ����E��˵`�s�n�3�ԑ:�,�����V�ݸ��6#��e9g�������{�)�oc�B&><������5s�����yh;[`M���HDz�(��}�{��
3v���o�L1	qi˾�s��n9]{z,0X�)�,�+��~�iz.sG���
�F�����1�^��f�6�;��4s;]���*||/z&���Q�u��N�17�-M2p<�p,c1��;����_<�!��u��O���!YR뭹];�M�␛*m��/7	�~0L-�;7�?�k���D��L����p�7H���𺅶�����r:��O�Nw௏�\�e;syf�i�c�;����'~��g�Q� W��P	(��	%ou��5�t=1�L MH�8�y3ƅ�p�c�0�=o|���E�@��|�	m�:Z�B�Θ��Ppݖ�������������Wv	q�����q�'�wvz�x�B'"�������IN�r��^8�0����y������pnN�^'�?|��;��"ĥ�w6��������ޠ0w�_>��N0�oHn����Fq��l�'�np:�#C{��`t��U�������ϰܯ�ʄz���9�	T�ِKa=��R�9A
!�X��%f�n�k�# ����_��E,9�μ��`�'c�{�R��
�k(�{V޳��k�>�.+8����v��x��=��������>9��u��]u��-����](��n�w����D�QpIZ�|.�/�� ĥ7�(����!7���Rh�n�!�k��T6rf@n�yfE�c�5+_{��m�ݷ�����E��٪&;�\�/��x5dU-`DD��8��7lde���j�ͅGg;�}r�iFt���&#��l3��G��&�����'���8p�u��=��Y��avU��A(��j���O���_?R7�A�@��3ǭCuI��A�qC�@k��Ņ�f��ݘ�D��IC���)�UM��2�n(�_4����v�SQN�.qQ~�������Ҵ���Bsm���~P��(�
��CC��k#m��E�H9]��o��1s���x����g�`�ᵡ�_���.j��4A���`P�dB���AL�h�ܞ�="�B'�hǯ���A����E��n��ߥ?nכs������07�L<7Mgfē1�N�Ce:m-7�e��M��1e�wg�	�u���Cb:Z6��K5��҇����F&4�ˣ�|��A"F%�E�����˅A���θ��ŗ��
)�J]^"�������_��Yq� 0�v�"/V�g�c5�^�P?rt� �	�V@I����wS�9SO4���O��w�� ������Ya��{�Bi�+�K�zk� �s��&W<uS����ے�,s_jEȶ�3b���ue�ඡ�^���6䮙zhZ�g�9�rM}s���J�):?c��ƪ��<�V`�iXOĉ�#����7$�6���;-�I�r\�|�Yy�����Z�	����o��/��$��g>xtڳ�es3��<�QSLfjS=u����G��}�N슘D�^�S P�TZ]�m҃�)(�5A��Mp�N��+��U�%��.d��S̔5r�_YۛR�x��Or�C��]� �NH�=��}gA�`P�Q���N�FF	��dE�u>Qw�N��׍�͊ �r�9���6U�cR�!`�(�f|�q	�5V�Yǆ�r�,�	�'�J���³#��	^�����W`�vx�X5C�P�w_�8 Q���cfI�}W���n�m�I٨��M8 �U����d��h��%~���u��tJ�]��_�z��5��i��:�t���K����C`�(�P N� (0���(&h�o=P�.N�as�<c�0E�v'�>H�W*׫�K(싛��/v��dZI�8/{�����pr:��A�`x��` � 0g�c� C+�]8�%J
��Mb�|�m��Y�iP4���`��]�a����~��j�) !��w�����-K�6���؅t.dG E�acП��O�������*
��~�N�(�kQf �����Y!��^oJ}�k�G��>K��\�+�4;�EÖ�l K=0�	!��EČL�\�IF"�.~:�$���3^�5�!Õ�c�YL��N D!vN�	t��WV��n��|�;�:θ��.l���y��!� y >���!�3jj�7D�nb|_E�~t�.쑕M.�m?+e~��,(�+��U�%>߅�n(,��H����y4L�H5lGa�=��B+�kG��6èG�r�JD+P����MC���dX�H�Ab��~�򼊹��A,��'*��F�4�H:��m�#�*�
��N�d�d��G� EFS�m`b��aĈ�j(=�·��%���[�ط��!
��GX�0t4"VDs�:�FT��E���H N�Xa@��!Hq���+�Է�˹�G�A@8}� �C��h��{l��t���-� fA�l$`O Σ��02\�\��/_���	#F�� ��!h,-c�{�F�zt�/:eH�C�tU����'�\h/��_�Bz� �Qػбp�D׎�O�:�D{qp���
O����e�����5�u�IZm��J�U�GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4��GS�z4���� �s�+a�Q    IEND�B`�                                                                                                                                                                                                                                                                                                                                                    lsPIhA4aRnnHJTLptIS6CNsY7iASpxUUMkReGpfbQW0vtN5pitvrsN28rwtBD0nc0+/Yft5XhaB6TuaXfsP28rwtA9J3NPv2H7eV4Wgek7mn37D9vK8LQPSdzT79h+3leFoHpO5pd+w/byvC0D0nc0u/Yft5XhaB6TuaXfsP28rwtA9J3NLv2H7eV4Wgek7ml37D9vK8LQPSdzS79h+3leFoHpO5p9+w/byvC0E9r7Reazy2HIYVPxkS/CUHVn26cosxyv2g7h89LYmZSXOenvLEQ1YaQ222RATcQCP8rSGqqA8S02W2pQ6FhMoAIlqCtsnwoCpdKClejI4i3Sgtb+GBxVuNBSFt1pV/RQefLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8utJ/koJ7WCbBU/LQXOPAFq1koK8B0pag90CggtBBf6qB0UDooHRQOigdFA6KB0UDooHRQOigdFA6KB0UDooI0EaBQf//Z" title="Toggle Table of Contents" alt="Toggle Table of Contents" />
  </a>
</div>

  <div class="wy-grid-for-nav">

    
    <nav data-toggle="wy-nav-shift" class="wy-nav-side">
      <div class="wy-side-nav-search">
        
          <a href="../index.html" class="fa fa-home"> CodeIgniter</a>
        
        
<div role="search">
  <form id="rtd-search-form" class="wy-form" action="../search.html" method="get">
    <input type="text" name="q" placeholder="Search docs" />
    <input type="hidden" name="check_keywords" value="yes" />
    <input type="hidden" name="area" value="default" />
  </form>
</div>
      </div>

      <div class="wy-menu wy-menu-vertical" data-spy="affix" role="navigation" aria-label="main navigation">
        
          
          
              <ul>
<li class="toctree-l1"><a class="reference internal" href="../general/welcome.html">Welcome to CodeIgniter</a></li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../installation/index.html">Installation Instructions</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../installation/downloads.html">Downloading CodeIgniter</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/index.html">Installation Instructions</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/upgrading.html">Upgrading From a Previous Version</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/troubleshooting.html">Troubleshooting</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../overview/index.html">CodeIgniter Overview</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../overview/getting_started.html">Getting Started</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/at_a_glance.html">CodeIgniter at a Glance</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/features.html">Supported Features</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/appflow.html">Application Flow Chart</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/mvc.html">Model-View-Controller</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/goals.html">Architectural Goals</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../tutorial/index.html">Tutorial</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/static_pages.html">Static pages</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/news_section.html">News section</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/create_news_items.html">Create news items</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/conclusion.html">Conclusion</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../contributing/index.html">Contrib�PNG

   IHDR   �   d   �9^�   	pHYs     ��  lIDATx��wx\ՙ��sn�����,Y�eI��ml�cH��MHR7�I�/���oI6�4�%�	�!X�4w�.��ni4*3����r�ӓoq6�j�O���<��<缿����v�[a�j�v��k�SX��)�z�V=s
��9�UϜªgNa�3���SX��)�z�V=s
��9�UϜªgNa�3���SX�|����/)�]����_�?q˭����(�]�
z�+�A�-k<�h��������o�c�f�^��P߻�e���q"�>{2dc��}�|�Nzw��4(>;up@��� �{����Mη{�%�7���82�/��p�� 7f��G�{_Eϝd�9�5L����I�jPT5�FU�	Q����c�=Q���x_�5j:����ה���c��oVN �ޣ�����ō�A
��9L��B^�������#���<�`����!�,j�Ԇ�>���U���n�_@5=H�>��dlnx���S?�`t����؂š���|좯Ʈ���ޕ:J�\�:���W�Z@�ܿ�\���X0��.Ǖ��,1�X'�������4�Zv[{���Viv[�Q5
�e%`�W׿6���Ak����	}�-˽����=����1N�'u.�;�E�%����c�{�����S��Rw�{�r���؞�E��E}�~��ɇ��� 'XLU������X�dlL*�4���n�@��Y|��Lv���;�d���lg�'*��J�k�dR�I+>���P���
�)���)f������9C:e�ë|�Apqj����Sp�t���K�3�����rEN��`W���}���_ئ?��IJWC �a�s�6oW6]�w�-/�t,����>I���E�G���^k���.��� ��ղ�����F�|���/ܶ=�o���o~�<�ᠳ�6 ��@����l^Yz��J�:�ax*4#UT���˿�=�[��d�_}�����~�MK�I֜e:�˫�U5�u��}XW��=�����]�i�gJ�{�4�<z#�LdyE�X����;8,w�Ж�Xqb׫�}�<�'�.y��ݟv[�X�eQ(��W+R�
OM��i���*���xJJ�?��>�Е�ң�-'�F��C˿�h������vw���+49'0B�����D�����'��d�p�w��.v|BvZ߽X�5����Dv�>yP�zh��:M'��^e��A�����1����3�{L�j���1 ,I�ZkemC��۾�hBq��恣��[�3��q�j� ��Δ]�S��@�N�%�W��D&K`�ח������$����<�u(�������TVf��L�w@ ��w!!`ݡ+@m^���kI%��_���p��ǵͷ�
�G�NP�g�����۾3η79'��7:M6����r�Y�ze`��/�;&Ƶ~ӒfC'��K?�}���?w� !�Ӌ�W6_{�������#ٿ�m_U����HuBؘ~Gm[��u��o0�<zpf��;|-6o�:��?{&v�s�+�^εmz���rO[��*6��.�ђ��k����#�N���y���J����r�3۬~Gl��t`�@��b�����__e���S
o�\�V��?�<�s���d��`�?��!�x�|e����~��Ӑ��ӊʪ�E+��k��³Ѥ���_e��?���c���̓qgOO�X���3�"5#]E瑛�)Ed�S�}��n^�\���dZ ��P���G����]V!0�+������\�':�W��*�A� �����w2ې��  ku��y�A h
�րc4/Hƅ�	-�3B1񩅣G��itÓW�2�h��{�M͔�qi�XnhwFs6.��e���z�S���:�۔�5�l� ��4�Ke� �㴰��3�""��ց�j;<�B `Y��%�G�����Ek} 0���
۶-C(��8vmg��x��/%���@�|n&MT� ME�i	 .�V�>�ڗ>p�pCy�X~�u_�� @�I'f
c��`d���vp��eB@���G��
,V�B h��1����B �/k,�,fMQ^�3�# `��-���<"מ�H+��#��ń�=e��Z��m�I@(@&t� 0<���~��uc�G���e���I x�B*SHgR� ��h�w^���K~�{��]u[��S���R����	޷�
Mღ؉Q��'r{ݕ�lh�����𡩔pV�9LݺD�����M�<��G_}n�qΦM��B-�M��".��Ǭ=/����K�6�R5��=/����/Hת/�����>�]s��˻�D���yrI3{��d|����6�`o����R3ҧ.�v�ަ� Mۛ���{���u��׎l�k�y�� ��ז������=�P�s�bȇg�| `i����p�����ey�x�P�b��5E��/�R�v��Kje���w$��m�u����9]�F��{��щ� wN�>Z#������2�g56�B{�d�-���c["%3��B��x�ly������(W�!����TY����9�.�/|��	���bB��K�W���X���n�Ӎ�ѧ_-��+6���vM�=_W5������)��3=�&wl_?��ghN^9eL�d���_�p�r_�ez�3w~s~����m���B{!��`��&NM����F���0�������������4��j���mc��ֱ�Y(g2w=_�aԱĻ�g�e��7�L��5��v$"�Ԋ&�w/CV�pQi �.-�i
�uu:�q�x?��	�5`#��%I�L����$邠��qTV�*�6oAS�ڝN���4 A;��W�K[3�T�\0<]nmr\�uzk��>���W\�$M4]' ��J4�[;<٬��޷��8��M�ҸR���*���4P���cf>e��5��ɔh��T�Ģ|M�1��kg-2J�f��^B�^{�H��ol>��E]��O@aP��{n��+m�Xi"Zr8X��B0F����e��?D7v���w�ȴ����-5� � �#JUt]'4��4���_���+k�X����gxA�	�^��d�2���V4x������G3�6��6���6X�7]�wY�C3����e`Y\*�h���k�Ը|�/�h=�B�iQi�Ǝq����̉N蒑���ap��t9�@��.
gF�*\�l:x�u�Ѩhm�9� @N�� 0��t\i[�|�՟�۹��@\m��1�N��X��Z�I��E�	=�g2ELY��Z%�2��V#n����N=֯��m�Z�5��K�	g��2��
�5��JR����A�*�0��1o��T�䲼¨�5T�ɀJq���fW��/�M��7�1��D*�17ceM��{k���"�^�E�8�0��zg��i}a�6�Η���nL�W�{��6�^����5B0����K?�mfj=��/%n����y*w��R�&2�߆?���	�D��D2����W���Mv��[�bΤX�K�/ ]m�cW7D���w��GQ��f  � �����FB�-H-��������� @[�S�t#�BN$*$�׋���:�d��j!Ϸ���l<�;�Пw�h ��N���}��)�a��#�W��jv`���e
����EY���-�����_�r:mL;�d�Hh�
�euN"� ^&]�cp��sj�hޙ�"fK��`��:�"��^�o��1F ��� ��  !F,��������� �~Ò���,��4�� E��$�]�������)�9�8���]�S/��� i!�� i*]N [��u*�[�t��ݥ�������\)O�,QTB܈N�r4��%#��<2K1x*4�9���(�Fg�sZ�=C*�����ڲ������b�� �$���5c#�\��X<`�#]-���ѩ�\A,�#kO�Tq�?�w�Y�Fso�(D��iDFA�3S�9-MSc�[������b�\6�kӿ�A�ae���޽��N����;�&3" h�L��4E<��	 �+�\�
(��Zat#Cx���2���~�pJ��� ����.���5��y�.�-*6��uF����^ޏ�V�28���@c(*�r�� ��XV_TCM{�  �����AMYoqX`Ju�w�4�X�8g^�+ʨ�����4 4X�"p'Uc:�+4B��4Q�T	m$Mv����B�h����+}Ӻ��t��h������Z)��{�T�� ���ʁ�
 t9> b�M�A�X1RJ����Q:P�'ѓ	vZ������"H��W\�jZ�]��b�Ȟ�RJ�9�"m[�.��Ԑ�2�Y��"�,F4',����Zg\cRŕ�a��S8G{Oߢ:�����#/��@8�G���s��1����(��%]L�+6ou�h�+jG�{dj���u.�ܗaEg�F/ms����s���S%�oK5W�c�E�F����6:%L�1 ��}����p6��;��O7�I�.@#Z���Ҡ� �3�O6��>��v�]�Q��^ Ӽ�ɏO��>�1�{A� ��cqߏ�_��n��.��]'K��9�cK�`�䙱�sր��̊�ZVtƤ�C�X  EO3�9z8��p��( @怵�&сb��8����^�j������d�����r�c���' �悱�_�x��������+0@fކ��m�r��g�Q�X�`��2I�d��=j�5o~�p�x�/z���Ŝ$b��A,�=� ���7|�g1�K�+<ҟc��G_�s}�\�!09A~0t��:�$�'� �  !b� ɠ6~Լ0�F3����~����޶�Є��h�a���2� ����i�4r�:B�Q�&��pY�
�g�!� �� s`q��}g�ڐ)��߾�Z9ߖ41T+yc�8A�<6h��6[�߻ڠ�����##h�@.�z :�*�G���g� ������N*]᱂������N  ����h#@�L��BYW�_��>�ׁD@�Ӡ+�( *���=%����btk�U�s�P�2�`v�&C��~�xp<c�܄��������RX9��A�8�����}�6�7��������1�J6� 4�ʼ,���%`rB)	�0��]��!�Ĭ�zߦ��%3 ��|d��t�C:f�ª���ň���훉�X�7b%gĘ�&�~��&�+�2DV�-�D�K���m������REW R� � >��&� "D{X��� [���f�$Yw�V_0�+��-�h�5�Q�
9���o�B|�Ը�[ ����
�]�ǚ�[� �f��gD�+,�  ���Am�����@t���[(=�#Al�R���;�|�!�}�!J�X���ʌ�@��J(&jm�4�U���޺V� @,���
���M�����d��"�t�*e `- s��a%�� �uO�DJ^In��vHA@Hw������i�㦥���ԟ6E!c�<H,�y�hB.��k��i�P%P��� ��X�\f�5~U�P�s�P�
Wүu@��Ȝ�y�@�� ��r��+�3�cSG�Cj  ���f���Em�0d���(�=0��[CoL�2ѫ[bI�XTg�A�9K`vk�()��C4UY'(��JW�!��=90{@*A�R���P �*� p��B��{H>"�d����%  ���  @AF�ٍ"l�O��1|�j��,�{��p�  Y<�
�E�+|��f(�0&  �pցX>��#�͛1C��o*��?қە�vb�3]� �����䛸�ul�<4)�?�lAP%��H`�! � @���vi_�Z�!�ГMo12!�Ĥ�C*G��Y/�23��ܞ��Tk��q��y}���b�LΛ)V���9dT�`y�\��ח�nX���U�Z/���v��x��K
`��Ap!��A�(��vѤ�+�������G
 �N��i̺󴇫?���*S5*[,k��f��T��CI�����ֵ�V �r����/�|����9{�Rq�/�� 02ɿt0�H	�)W�߳+ad�	�S�x�Ú�h*��\�i��nx*�4�{�h��|:��S�]�����ַy^�T]V��ü�?�|�7U�S�#c�F���,3�_��s�Y~ ȕ����}NjSk������^��q_���mY>�4��>Ś����taE�/�.��$ET4������{/~���rכ*Za&/uݿ���{<]fi�nb2%�k7��2�(�IF>�)��i
��Y����l0���,�	��DR����!�&g���J h��s<MaNRUch,�:CaNR�%����xf�����g;����8���<�/j&����,�`&4�e�N��$o�}���l�?����]E�۶�s/�>��_X��\%z�P�D��.Y��*� ��ݟ(	"��\� �jl���  ��g9D���1O��p������R�
`���u1����3bR5221~��g &={0�3��׸�(��궍�w^y����?��K��������}�h����ݭ��3�M o̙ �|��O��9C =�]�ҿ�2��|��)�;:o]�u�m	�-4 L$�{�������/]�!�te�����^x��ˑ@�(�[�{�A������#kARȔ�j��r�\V�w2��lDiNaŁ0��K^������hՅ��F��!����D��Ͼl�����'�;���o�҇�gN$d^�̞:9\D>��hQ�NN�U/�����
�Hn�u��w}�b��tA�0�O�j�ɝ��{�=�z�R��VJW�]`�o��\��W��ߠ8>l
�B���OKV5��pW���_ɇV��?T�V�9΄9�UϜªgNa�3���SX��)�z�V=s
��9�UϜªgNa�3���SX��)�z�V=s
��9�U� ~����6�     IEND�B`�                                                                      <a class="reference internal" href="../libraries/index.html">Libraries</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../libraries/benchmark.html">Benchmarking Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/caching.html">Caching Driver</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/calendar.html">Calendaring Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/cart.html">Shopping Cart Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/config.html">Config Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/email.html">Email Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/encrypt.html">Encrypt Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/encryption.html">Encryption Library</a></li>
<li class="toctree-l2"><a class="reference internal" hr<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Code Igniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * Database Utility Class
 *
 * @category	Database
 * @author		ExpressionEngine Dev Team
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_forge {

	var $fields			= array();
	var $keys			= array();
	var $primary_keys	= array();
	var $db_char_set	=	'';

	/**
	 * Constructor
	 *
	 * Grabs the CI super object instance so we can access it.
	 *
	 */
	function __construct()
	{
		// Assign the main database object to $this->db
		$CI =& get_instance();
		$this->db =& $CI->db;
		log_message('debug', "Database Forge Class Initialized");
	}

	// --------------------------------------------------------------------

	/**
	 * Create database
	 *
	 * @access	public
	 * @param	string	the database name
	 * @return	bool
	 */
	function create_database($db_name)
	{
		$sql = $this->_create_database($db_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	public
	 * @param	string	the database name
	 * @return	bool
	 */
	function drop_database($db_name)
	{
		$sql = $this->_drop_database($db_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Add Key
	 *
	 * @access	public
	 * @param	string	key
	 * @param	string	type
	 * @return	void
	 */
	function add_key($key = '', $primary = FALSE)
	{
		if (is_array($key))
		{
			foreach ($key as $one)
			{
				$this->add_key($one, $primary);
			}

			return;
		}

		if ($key == '')
		{
			show_error('Key information is required for that operation.');
		}

		if ($primary === TRUE)
		{
			$this->primary_keys[] = $key;
		}
		else
		{
			$this->keys[] = $key;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Add Field
	 *
	 * @access	public
	 * @param	string	collation
	 * @return	void
	 */
	function add_field($field = '')
	{
		if ($field == '')
		{
			show_error('Field information is required.');
		}

		if (is_string($field))
		{
			if ($field == 'id')
			{
				$this->add_field(array(
										'id' => array(
													'type' => 'INT',
													'constraint' => 9,
													'auto_increment' => TRUE
													)
								));
				$this->add_key('id', TRUE);
			}
			else
			{
				if (strpos($field, ' ') === FALSE)
				{
					show_error('Field information is required for that operation.');
				}

				$this->fields[] = $field;
			}
		}

		if (is_array($field))
		{
			$this->fields = array_merge($this->fields, $field);
		}

	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	public
	 * @param	string	the table name
	 * @return	bool
	 */
	function create_table($table = '', $if_not_exists = FALSE)
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		if (count($this->fields) == 0)
		{
			show_error('Field information is required.');
		}

		$sql = $this->_create_table($this->db->dbprefix.$table, $this->fields, $this->primary_keys, $this->keys, $if_not_exists);

		$this->_reset();
		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	public
	 * @param	string	the table name
	 * @return	bool
	 */
	function drop_table($table_name)
	{
		$sql = $this->_drop_table($this->db->dbprefix.$table_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Rename Table
	 *
	 * @access	public
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	bool
	 */
	function rename_table($table_name, $new_table_name)
	{
		if ($table_name == '' OR $new_table_name == '')
		{
			show_error('A table name is required for that operation.');
		}

		$sql = $this->_rename_table($this->db->dbprefix.$table_name, $this->db->dbprefix.$new_table_name);
		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Column Add
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @param	string	the column definition
	 * @return	bool
	 */
	function add_column($table = '', $field = array(), $after_field = '')
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		// add field info into field array, but we can only do one at a time
		// so we cycle through

		foreach ($field as $k => $v)
		{
			$this->add_field(array($k => $field[$k]));

			if (count($this->fields) == 0)
			{
				show_error('Field information is required.');
			}

			$sql = $this->_alter_table('ADD', $this->db->dbprefix.$table, $this->fields, $after_field);

			$this->_reset();

			if ($this->db->query($sql) === FALSE)
			{
				return FALSE;
			}
		}

		return TRUE;

	}

	// --------------------------------------------------------------------

	/**
	 * Column Drop
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @return	bool
	 */
	function drop_column($table = '', $column_name = '')
	{

		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		if ($column_name == '')
		{
			show_error('A column name is required for that operation.');
		}

		$sql = $this->_alter_table('DROP', $this->db->dbprefix.$table, $column_name);

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Column Modify
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @param	string	the column definition
	 * @return	bool
	 */
	function modify_column($table = '', $field = array())
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		// add field info into field array, but we can only do one at a time
		// so we cycle through

		foreach ($field as $k => $v)
		{
			// If no name provided, use the current name
			if ( ! isset($field[$k]['name']))
			{
				$field[$k]['name'] = $k;
			}

			$this->add_field(array($k => $field[$k]));

			if (count($this->fields) == 0)
			{
				show_error('Field information is required.');
			}

			$sql = $this->_alter_table('CHANGE', $this->db->dbprefix.$table, $this->fields);

			$this->_reset();

			if ($this->db->query($sql) === FALSE)
			{
				return FALSE;
			}
		}

		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Reset
	 *
	 * Resets table creation vars
	 *
	 * @access	private
	 * @return	void
	 */
	function _reset()
	{
		$this->fields		= array();
		$this->keys			= array();
		$this->primary_keys	= array();
	}

}

/* End of file DB_forge.php */
/* Location: ./system/database/DB_forge.php */                                                                                                                                                                                                                                         CA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,iCxDw1LH,MAAA,IwDt1LC,OAAA,EACE,cAAA,KACA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,kCxDw1LH,OAAA,EwDt1LC,KAAA,IACE,cAAA,KACA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,8BxDw1LH,IAAA,IwDt1LC,KAAA,EACE,WAAA,KACA,aAAA,IAAA,IAAA,IAAA,EACA,mBAAA,KAEA,6BxDw1LH,IAAA,IwDt1LC,MAAA,EACE,WAAA,KACA,aAAA,IAAA,EAAA,IAAA,IACA,kBAAA,KAEA,+BxDw1LH,IAAA,EwDt1LC,KAAA,IACE,YAAA,KACA,aAAA,EAAA,IAAA,IACA,oBAAA,KAEA,oCxDw1LH,IAAA,EwDt1LC,MAAA,IACE,WAAA,KACA,aAAA,EAAA,IAAA,IACA,oBAAA,KAEA,qCxDw1LH,IAAA,E0Dr7LC,KAAM,IACWidth && (o.maxWidth < data.width),
			ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
			isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.position.top + this.size.height,
			cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
		if (isminw) {
			data.width = o.minWidth;
		}
		if (isminh) {
			data.height = o.minHeight;
		}
		if (ismaxw) {
			data.width = o.maxWidth;
		}
		if (ismaxh) {
			data.height = o.maxHeight;
		}

		if (isminw && cw) {
			data.left = dw - o.minWidth;
		}
		if (ismaxw && cw) {
			data.left = dw - o.maxWidth;
		}
		if (isminh && ch) {
			data.top = dh - o.minHeight;
		}
		if (ismaxh && ch) {
			data.top = dh - o.maxHeight;
		}

		// Fixing jump error on top/left - bug #2330
		if (!data.width && !data.height && !data.left && data.top) {
			data.top = null;
		} else if (!data.width && !data.height && !data.top && data.left) {
			data.left = null;
		}

		return data;
	},

	_getPaddingPlusBorderDimensions: function( element ) {
		var i = 0,
			widths = [],
			borders = [
				element.css( "borderTopWidth" ),
				element.css( "borderRightWidth" ),
				element.css( "borderBottomWidth" ),
				element.css( "borderLeftWidth" )
			],
			paddings = [
				element.css( "paddingTop" ),
				element.css( "paddingRight" ),
				element.css( "paddingBottom" ),
				element.css( "paddingLeft" )
			];

		for ( ; i < 4; i++ ) {
			widths[ i ] = ( parseInt( borders[ i ], 10 ) || 0 );
			widths[ i ] += ( parseInt( paddings[ i ], 10 ) || 0 );
		}

		return {
			height: widths[ 0 ] + widths[ 2 ],
			width: widths[ 1 ] + widths[ 3 ]
		};
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) {
			return;
		}

		var prel,
			i = 0,
			element = this.helper || this.element;

		for ( ; i < this._proportionallyResizeElements.length; i++) {

			prel = this._proportionallyResizeElements[i];

			// TODO: Seems like a bug to cache this.outerDimensions
			// considering that we are in a loop.
			if (!this.outerDimensions) {
				this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
			}

			prel.css({
				height: (element.height() - this.outerDimensions.height) || 0,
				width: (element.width() - this.outerDimensions.width) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if (this._helper) {

			this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [ event, this.ui() ]);
		(n !== "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && (/textarea/i).test(pr[0].nodeName),
			soffseth = ista && that._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
			left = (parseInt(that.element.css("left"), 10) +
				(that.position.left - that.originalPosition.left)) || null,
			top = (parseInt(that.element.css("top"), 10) +
				(that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css("width"), 10),
						height: parseInt(that.element.css("height"), 10),
						top: parseInt(that.element.css("top"), 10),
						left: parseInt(that.element.css("left"), 10)
					};

					if (pr && pr.length) {
						$(pr[0]).css({ width: data.width, height: data.height });
					}

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add( "resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

		if ( !ce ) {
			return;
		}

		that.containerElement = $( ce );

		if ( /document/.test( oc ) || oc === document ) {
			that.containerOffset = {
				left: 0,
				top: 0
			};
			that.containerPosition = {
				left: 0,
				top: 0
			};

			that.parentData = {
				element: $( document ),
				left: 0,
				top: 0,
				width: $( document ).width(),
				height: $( document ).height() || document.body.parentNode.scrollHeight
			};
		} else {
			element = $( ce );
			p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function( i, name ) {
				p[ i ] = that._num( element.css( "padding" + name ) );
			});

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = {
				height: ( element.innerHeight() - p[ 3 ] ),
				width: ( element.innerWidth() - p[ 1 ] )
			};

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
			height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

			that.parentData = {
				element: ce,
				left: co.left,
				top: co.top,
				width: width,
				height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = {
				top: 0,
				left: 0
			},
			ce = that.containerElement,
			continueResize = true;

		if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
			cop = co;
		}

		if ( cp.left < ( that._helper ? co.left : 0 ) ) {
			that.size.width = that.size.width +
				( that._helper ?
					( that.position.left - co.left ) :
					( that.position.left - cop.left ) );

			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if ( cp.top < ( that._helper ? co.top : 0 ) ) {
			that.size.height = that.size.height +
				( that._helper ?
					( that.position.top - co.top ) :
					that.position.top );

			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
		isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

		if ( isParent && isOffsetRelative ) {
			that.offset.left = that.parentData.left + that.position.left;
			that.offset.top = that.parentData.top + that.position.top;
		} else {
			that.offset.left = that.element.offset().left;
			that.offset.top = that.element.offset().top;
		}

		woset = Math.abs( that.sizeDiff.width +
			(that._helper ?
				that.offset.left - cop.left :
				(that.offset.left - co.left)) );

		hoset = Math.abs( that.sizeDiff.height +
			(that._helper ?
				that.offset.top - cop.top :
				(that.offset.top - co.top)) );

		if ( woset + that.size.width >= that.parentData.width ) {
			that.size.width = that.parentData.width - woset;
			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
		}

		if ( hoset + that.size.height >= that.parentData.height ) {
			that.size.height = that.parentData.height - hoset;
			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
		}

		if ( !continueResize ) {
			that.position.left = that.prevPosition.left;
			that.position.top = that.prevPosition.top;
			that.size.width = that.prevSize.width;
			that.size.height = that.prevSize.height;
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $( that.helper ),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}

		if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}
	}
});

$.ui.plugin.add("resizable", "alsoResize", {

	start: function() {
		var that = $(this).resizable( "instance" ),
			o = that.options;

		$(o.alsoResize).each(function() {
			var el = $(this);
			el.data("ui-resizable-alsoresize", {
				width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
				left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
			});
		});
	},

	resize: function(event, ui) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0,
				width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0,
				left: (that.position.left - op.left) || 0
			};

			$(o.alsoResize).each(function() {
				var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
					css = el.parents(ui.originalElement[0]).length ?
							[ "width", "height" ] :
							[ "width", "height", "top", "left" ];

				$.each(css, function(i, prop) {
					var sum = (start[prop] || 0) + (delta[prop] || 0);
					if (sum && sum >= 0) {
						style[prop] = sum || null;
					}
				});

				el.css(style);
			});
	},

	stop: function() {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).resizable( "instance" ), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({
				opacity: 0.25,
				display: "block",
				position: "relative",
				height: cs.height,
				width: cs.width,
				margin: 0,
				left: 0,
				top: 0
			})
			.addClass("ui-resizable-ghost")
			.addClass(typeof o.ghost === "string" ? o.ghost : "");

		that.ghost.appendTo(that.helper);

	},

	resize: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost) {
			that.ghost.css({
				position: "relative",
				height: that.size.height,
				width: that.size.width
			});
		}
	},

	stop: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost && that.helper) {
			that.helper.get(0).removeChild(that.ghost.get(0));
		}
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var outerDimensions,
			that = $(this).resizable( "instance" ),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
			gridX = (grid[0] || 1),
			gridY = (grid[1] || 1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX,
			oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
			isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth),
			isMinHeight = o.minHeight && (o.minHeight > newHeight);

		o.grid = grid;

		if (isMinWidth) {
			newWidth += gridX;
		}
		if (isMinHeight) {
			newHeight += gridY;
		}
		if (isMaxWidth) {
			newWidth -= gridX;
		}
		if (isMaxHeight) {
			newHeight -= gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY <= 0 || newWidth - gridX <= 0) {
				outerDimensions = that._getPaddingPlusBorderDimensions( this );
			}

			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				newHeight = gridY - outerDimensions.height;
				that.size.height = newHeight;
				that.position.top = op.top + os.height - newHeight;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				newWidth = gridX - outerDimensions.width;
				that.size.width = newWidth;
				that.position.left = op.left + os.width - newWidth;
			}
		}
	}

});

var resizable = $.ui.resizable;


/*!
 * jQuery UI Dialog 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 */


var dialog = $.widget( "ui.dialog", {
	version: "1.11.4",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		closeOnEscape: true,
		closeText: "Close",
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	sizeRelatedOptions: {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},

	resizableRelatedOptions: {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},

	_create: function() {
		this.originalCss = {
			display: this.element[ 0 ].style.display,
			width: this.element[ 0 ].style.width,
			minHeight: this.element[ 0 ].style.minHeight,
			maxHeight: this.element[ 0 ].style.maxHeight,
			height: this.element[ 0 ].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr( "title" );
		this.options.title = this.options.title || this.originalTitle;

		this._createWrapper();

		this.element
			.show()
			.removeAttr( "title" )
			.addClass( "ui-dialog-content ui-widget-content" )
			.appendTo( this.uiDialog );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;

		this._trackFocus();
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && (element.jquery || element.nodeType) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._untrackInstance();
		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.removeClass( "ui-dialog-content ui-widget-content" )
			.css( this.originalCss )
			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.stop( true, true ).remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var activeElement,
			that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._focusedElement = null;
		this._destroyOverlay();
		this._untrackInstance();

		if ( !this.opener.filter( ":focusable" ).focus().length ) {

			// support: IE9
			// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
			try {
				activeElement = this.document[ 0 ].activeElement;

				// Support: IE9, IE10
				// If the <body> is blurred, IE will switch windows, see #4520
				if ( activeElement && activeElement.nodeName.toLowerCase() !== "body" ) {

					// Hiding a focused element doesn't trigger blur in WebKit
					// so in case we have nothing to focus on, explicitly blur the active element
					// https://bugs.webkit.org/show_bug.cgi?id=47182
					$( activeElement ).blur();
				}
			} catch ( error ) {}
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		});
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = false,
			zIndices = this.uiDialog.siblings( ".ui-front:visible" ).map(function() {
				return +$( this ).css( "z-index" );
			}).get(),
			zIndexMax = Math.max.apply( null, zIndices );

		if ( zIndexMax >= +this.uiDialog.css( "z-index" ) ) {
			this.uiDialog.css( "z-index", zIndexMax + 1 );
			moved = true;
		}

		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( this.document[ 0 ].activeElement );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );

		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if ( this.overlay ) {
			this.overlay.css( "z-index", this.uiDialog.css( "z-index" ) - 1 );
		}

		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger( "focus" );
		});

		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();

		this._trigger( "open" );
	},

	_focusTabbable: function() {
		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		var hasFocus = this._focusedElement;
		if ( !hasFocus ) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.element.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).focus();
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = this.document[0].activeElement,
				isActive = this.uiDialog[0] === activeElement ||
					$.contains( this.uiDialog[0], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );
		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $("<div>")
			.addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
				this.options.dialogClass )
			.hide()
			.attr({
				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			})
			.appendTo( this._appendTo() );

		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
					return;
				}
				var tabbables = this.uiDialog.find( ":tabbable" ),
					first = tabbables.filter( ":first" ),
					last = tabbables.filter( ":last" );

				if ( ( event.target === last[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
					this._delay(function() {
						first.focus();
					});
					event.preventDefault();
				} else if ( ( event.target === first[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
					this._delay(function() {
						last.focus();
					});
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		});

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find( "[aria-describedby]" ).length ) {
			this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr( "id" )
			});
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $( "<div>" )
			.addClass( "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" )
			.prependTo( this.uiDialog );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {
				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest( ".ui-dialog-titlebar-close" ) ) {
					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.focus();
				}
			}
		});

		// support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button({
				label: this.options.closeText,
				icons: {
					primary: "ui-icon-closethick"
				},
				text: false
			})
			.addClass( "ui-dialog-titlebar-close" )
			.appendTo( this.uiDialogTitlebar );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		});

		uiDialogTitle = $( "<span>" )
			.uniqueId()
			.addClass( "ui-dialog-title" )
			.prependTo( this.uiDialogTitlebar );
		this._title( uiDialogTitle );

		this.uiDialog.attr({
			"aria-labelledby": uiDialogTitle.attr( "id" )
		});
	},

	_title: function( title ) {
		if ( !this.options.title ) {
			title.html( "&#160;" );
		}
		title.text( this.options.title );
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $( "<div>" )
			.addClass( "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" );

		this.uiButtonSet = $( "<div>" )
			.addClass( "ui-dialog-buttonset" )
			.appendTo( this.uiDialogButtonPane );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass( "ui-dialog-buttons" );
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );
			// Change the context for the click callback to be the main element
			click = props.click;
			props.click = function() {
				click.apply( that.element[ 0 ], arguments );
			};
			buttonOptions = {
				icons: props.icons,
				text: props.showText
			};
			delete props.icons;
			delete props.showText;
			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet );
		});
		this.uiDialog.addClass( "ui-dialog-buttons" );
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-dragging" );
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();

				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-dragging" );
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css("position"),
			resizeHandles = typeof handles === "string" ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-resizing" );
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();

				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-resizing" );
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position );
	},

	_trackFocus: function() {
		this._on( this.widget(), {
			focusin: function( event ) {
				this._makeFocusTarget();
				this._focusedElement = $( event.target );
			}
		});
	},

	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},

	_untrackInstance: function() {
		var instances = this._trackingInstances(),
			exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},

	_trackingInstances: function() {
		var instances = this.document.data( "ui-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "ui-dialog-instances", instances );
		}
		return instances;
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {
		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in that.sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in that.resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "dialogClass" ) {
			uiDialog
				.removeClass( this.options.dialogClass )
				.addClass( value );
		}

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button({
				// Ensure that we always pass a string
				label: "" + value
			});
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is( ":data(ui-draggable)" );
			if ( isDraggable && !value ) {
				uiDialog.draggable( "destroy" );
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {
			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is( ":data(ui-resizable)" );
			if ( isResizable && !value ) {
				uiDialog.resizable( "destroy" );
			}

			// currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find( ".ui-dialog-title" ) );
		}
	},

	_size: function() {
		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			});
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css({
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				})
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[0];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest( ".ui-dialog" ).length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest( ".ui-datepicker" ).length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay(function() {
			isOpening = false;
		});

		if ( !this.document.data( "ui-dialog-overlays" ) ) {

			// Prevent use of anchors and inputs
			// Using _on() for an event handler shared across many instances is
			// safe because the dialogs stack and must be closed in reverse order
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}

					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						this._trackingInstances()[ 0 ]._focusTabbable();
					}
				}
			});
		}

		this.overlay = $( "<div>" )
			.addClass( "ui-widget-overlay ui-front" )
			.appendTo( this._appendTo() );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		});
		this.document.data( "ui-dialog-overlays",
			(this.document.data( "ui-dialog-overlays" ) || 0) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "ui-dialog-overlays" ) - 1;

			if ( !overlays ) {
				this.document
					.unbind( "focusin" )
					.removeData( "ui-dialog-overlays" );
			} else {
				this.document.data( "ui-dialog-overlays", overlays );
			}

			this.overlay.remove();
			this.overlay = null;
		}
	}
});


/*!
 * jQuery UI Droppable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/droppable/
 */


$.widget( "ui.droppable", {
	version: "1.11.4",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: "default",
		tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction( accept ) ? accept : function( d ) {
			return d.is( accept );
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {
				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {
				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		this._addToManager( o.scope );

		o.addClasses && this.element.addClass( "ui-droppable" );

	},

	_addToManager: function( scope ) {
		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
		$.ui.ddmanager.droppables[ scope ].push( this );
	},

	_splice: function( drop ) {
		var i = 0;
		for ( ; i < drop.length; i++ ) {
			if ( drop[ i ] === this ) {
				drop.splice( i, 1 );
			}
		}
	},

	_destroy: function() {
		var drop = $.ui.ddmanager.droppables[ this.options.scope ];

		this._splice( drop );

		this.element.removeClass( "ui-droppable ui-droppable-disabled" );
	},

	_setOption: function( key, value ) {

		if ( key === "accept" ) {
			this.accept = $.isFunction( value ) ? value : function( d ) {
				return d.is( value );
			};
		} else if ( key === "scope" ) {
			var drop = $.ui.ddmanager.droppables[ this.options.scope ];

			this._splice( drop );
			this._addToManager( value );
		}

		this._super( key, value );
	},

	_activate: function( event ) {
		var draggable = $.ui.ddmanager.current;
		if ( this.options.activeClass ) {
			this.element.addClass( this.options.activeClass );
		}
		if ( draggable ){
			this._trigger( "activate", event, this.ui( draggable ) );
		}
	},

	_deactivate: function( event ) {
		var draggable = $.ui.ddmanager.current;
		if ( this.options.activeClass ) {
			this.element.removeClass( this.options.activeClass );
		}
		if ( draggable ){
			this._trigger( "deactivate", event, this.ui( draggable ) );
		}
	},

	_over: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.hoverClass ) {
				this.element.addClass( this.options.hoverClass );
			}
			this._trigger( "over", event, this.ui( draggable ) );
		}

	},

	_out: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.hoverClass ) {
				this.element.removeClass( this.options.hoverClass );
			}
			this._trigger( "out", event, this.ui( draggable ) );
		}

	},

	_drop: function( event, custom ) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return false;
		}

		this.element.find( ":data(ui-droppable)" ).not( ".ui-draggable-dragging" ).each(function() {
			var inst = $( this ).droppable( "instance" );
			if (
				inst.options.greedy &&
				!inst.options.disabled &&
				inst.options.scope === draggable.options.scope &&
				inst.accept.call( inst.element[ 0 ], ( draggable.currentItem || draggable.element ) ) &&
				$.ui.intersect( draggable, $.extend( inst, { offset: inst.element.offset() } ), inst.options.tolerance, event )
			) { childrenIntersection = true; return false; }
		});
		if ( childrenIntersection ) {
			return false;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.activeClass ) {
				this.element.removeClass( this.options.activeClass );
			}
			if ( this.options.hoverClass ) {
				this.element.removeClass( this.options.hoverClass );
			}
			this._trigger( "drop", event, this.ui( draggable ) );
			return this.element;
		}

		return false;

	},

	ui: function( c ) {
		return {
			draggable: ( c.currentItem || c.element ),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.ui.intersect = (function() {
	function isOverAxis( x, reference, size ) {
		return ( x >= reference ) && ( x < ( reference + size ) );
	}

	return function( draggable, droppable, toleranceMode, event ) {

		if ( !droppable.offset ) {
			return false;
		}

		var x1 = ( draggable.positionAbs || draggable.position.absolute ).left + draggable.margins.left,
			y1 = ( draggable.positionAbs || draggable.position.absolute ).top + draggable.margins.top,
			x2 = x1 + draggable.helperProportions.width,
			y2 = y1 + draggable.helperProportions.height,
			l = droppable.offset.left,
			t = droppable.offset.top,
			r = l + droppable.proportions().width,
			b = t + droppable.proportions().height;

		switch ( toleranceMode ) {
		case "fit":
			return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
		case "intersect":
			return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
				x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
				t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
				y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
		case "pointer":
			return isOverAxis( event.pageY, t, droppable.proportions().height ) && isOverAxis( event.pageX, l, droppable.proportions().width );
		case "touch":
			return (
				( y1 >= t && y1 <= b ) || // Top edge touching
				( y2 >= t && y2 <= b ) || // Bottom edge touching
				( y1 < t && y2 > b ) // Surrounded vertically
			) && (
				( x1 >= l && x1 <= r ) || // Left edge touching
				( x2 >= l && x2 <= r ) || // Right edge touching
				( x1 < l && x2 > r ) // Surrounded horizontally
			);
		default:
			return false;
		}
	};
})();

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function( t, event ) {

		var i, j,
			m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
			type = event ? event.type : null, // workaround for #2317
			list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

		droppablesLoop: for ( i = 0; i < m.length; i++ ) {

			// No disabled and non-accepted
			if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
				continue;
			}

			// Filter out elements in the current dragged item
			for ( j = 0; j < list.length; j++ ) {
				if ( list[ j ] === m[ i ].element[ 0 ] ) {
					m[ i ].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
			if ( !m[ i ].visible ) {
				continue;
			}

			// Activate the droppable if used directly from draggables
			if ( type === "mousedown" ) {
				m[ i ]._activate.call( m[ i ], event );
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

		}

	},
	drop: function( draggable, event ) {

		var dropped = false;
		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {

			if ( !this.options ) {
				return;
			}
			if ( !this.options.disabled && this.visible && $.ui.intersect( draggable, this, this.options.tolerance, event ) ) {
				dropped = this._drop.call( this, event ) || dropped;
			}

			if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call( this, event );
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		// Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if ( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		});
	},
	drag: function( draggable, event ) {

		// If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if ( draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}

		// Run through all droppables and check their positions based on specific tolerance options
		$.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {

			if ( this.options.disabled || this.greedyChild || !this.visible ) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = $.ui.intersect( draggable, this, this.options.tolerance, event ),
				c = !intersects && this.isover ? "isout" : ( intersects && !this.isover ? "isover" : null );
			if ( !c ) {
				return;
			}

			if ( this.options.greedy ) {
				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents( ":data(ui-droppable)" ).filter(function() {
					return $( this ).droppable( "instance" ).options.scope === scope;
				});

				if ( parent.length ) {
					parentInstance = $( parent[ 0 ] ).droppable( "instance" );
					parentInstance.greedyChild = ( c === "isover" );
				}
			}

			// we just moved into a greedy child
			if ( parentInstance && c === "isover" ) {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call( parentInstance, event );
			}

			this[ c ] = true;
			this[c === "isout" ? "isover" : "isout"] = false;
			this[c === "isover" ? "_over" : "_out"].call( this, event );

			// we just moved out of a greedy child
			if ( parentInstance && c === "isout" ) {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call( parentInstance, event );
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		// Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if ( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

var droppable = $.ui.droppable;


/*!
 * jQuery UI Effects 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/effects-core/
 */


var dataSpace = "ui-effects-",

	// Create a local jQuery because jQuery Color relies on it and the
	// global may not exist with AMD and a custom build (#10199)
	jQuery = $;

$.effects = {
	effect: {}
};

/*!
 * jQuery Color Animations v2.1.2
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Wed Jan 16 08:47:09 2013 -0600
 */
(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [ {
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		} ],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && jQuery.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + ( q - p ) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + ( q - p ) * ( ( 2 / 3 ) - h ) * 6;
	}
	return p;
}

spaces.hsla.to = function( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
	// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
	if ( diff === 0 ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};

each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook = function( hook ) {
	var hooks = hook.split( " " );
	each( hooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed, curElem,
					backgroundColor = "";

				if ( value !== "transparent" && ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) ) {
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						while (
							(backgroundColor === "" || backgroundColor === "transparent") &&
							curElem && curElem.style
						) {
							try {
								backgroundColor = jQuery.css( curElem, "backgroundColor" );
								curElem = curElem.parentNode;
							} catch ( e ) {
							}
						}

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				try {
					elem.style[ hook ] = value;
				} catch ( e ) {
					// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
				}
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

};

color.hook( stepHooks );

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

})( jQuery );

/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/
(function() {

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	};

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles( elem ) {
	var key, len,
		style = elem.ownerDocument.defaultView ?
			elem.ownerDocument.defaultView.getComputedStyle( elem, null ) :
			elem.currentStyle,
		styles = {};

	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				styles[ $.camelCase( key ) ] = style[ key ];
			}
		}
	// support: Opera, IE <9
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				styles[ key ] = style[ key ];
			}
		}
	}

	return styles;
}

function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] !== value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			applyClassChange,
			allAnimations = o.children ? animated.find( "*" ).addBack() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				start: getElementStyles( this )
			};
		});

		// apply class change
		applyClassChange = function() {
			$.each( classAnimationActions, function(i, action) {
				if ( value[ action ] ) {
					animated[ action + "Class" ]( value[ action ] );
				}
			});
		};
		applyClassChange();

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred(),
				opts = $.extend({}, o, {
					queue: false,
					complete: function() {
						dfd.resolve( styleInfo );
					}
				});

			this.el.animate( this.diff, opts );
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			applyClassChange();

			// for each animated element,
			// clear all css properties that were animated
			$.each( arguments, function() {
				var el = this.el;
				$.each( this.diff, function(key) {
					el.css( key, "" );
				});
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	addClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return speed ?
				$.effects.animateClass.call( this,
					{ add: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.addClass ),

	removeClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return arguments.length > 1 ?
				$.effects.animateClass.call( this,
					{ remove: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.removeClass ),

	toggleClass: (function( orig ) {
		return function( classNames, force, speed, easing, callback ) {
			if ( typeof force === "boolean" || force === undefined ) {
				if ( !speed ) {
					// without speed parameter
					return orig.apply( this, arguments );
				} else {
					return $.effects.animateClass.call( this,
						(force ? { add: classNames } : { remove: classNames }),
						speed, easing, callback );
				}
			} else {
				// without force parameter
				return $.effects.animateClass.call( this,
					{ toggle: classNames }, force, speed, easing );
			}
		};
	})( $.fn.toggleClass ),

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.call( this, {
			add: add,
			remove: remove
		}, speed, easing, callback );
	}
});

})();

/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

(function() {

$.extend( $.effects, {
	version: "1.11.4",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for ( var i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		var val, i;
		for ( i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				val = element.data( dataSpace + set[ i ] );
				// support: jQuery 1.6.2
				// http://bugs.jquery.com/ticket/9917
				// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
				// We can't differentiate between "" and 0 here, so we just assume
				// empty string since it's likely to be a more common value...
				if ( val === undefined ) {
					val = "";
				}
				element.css( set[ i ], val );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		}
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		}
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		// support: Firefox
		// Firefox incorrectly exposes anonymous content
		// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
		try {
			active.id;
		} catch ( e ) {
			active = document.body;
		}

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}

		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function( i, x ) {
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) {
				value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
			}
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// allow passing all options as the first parameter
	if ( $.isPlainObject( effect ) ) {
		options = effect;
		effect = effect.effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect, null, ...)
	if ( options == null ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( typeof options === "number" || $.fx.speeds[ options ] ) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 :
		typeof speed === "number" ? speed :
		speed in $.fx.speeds ? $.fx.speeds[ speed ] :
		$.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardAnimationOption( option ) {
	// Valid standard speeds (nothing, number, named speed)
	if ( !option || typeof option === "number" || $.fx.speeds[ option ] ) {
		return true;
	}

	// Invalid strings - treat as "normal" speed
	if ( typeof option === "string" && !$.effects.effect[ option ] ) {
		return true;
	}

	// Complete callback
	if ( $.isFunction( option ) ) {
		return true;
	}

	// Options hash (but not naming an effect)
	if ( typeof option === "object" && !option.effect ) {
		return true;
	}

	// Didn't match any standard API
	return false;
}

$.fn.extend({
	effect: function( /* effect, options, speed, callback */ ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ];

		if ( $.fx.off || !effectMethod ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// If the element already has the correct final state, delegate to
			// the core methods so the internal tracking of "olddisplay" works.
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				elem[ mode ]();
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
	},

	show: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "show";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.show ),

	hide: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "hide";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.hide ),

	toggle: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) || typeof option === "boolean" ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "toggle";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.toggle ),

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 ) {
				val = [ parseFloat( style ), unit ];
			}
		});
		return val;
	}
});

})();

/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

(function() {

// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < 0.5 ?
			easeIn( p * 2 ) / 2 :
			1 - easeIn( p * -2 + 2 ) / 2;
	};
});

})();

var effect = $.effects;


/*!
 * jQuery UI Effects Blind 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/blind-effect/
 */


var effectBlind = $.effects.effect.blind = function( o, done ) {
	// Create element
	var el = $( this ),
		rvertical = /up|down|vertical/,
		rpositivemotion = /up|left|vertical|horizontal/,
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		direction = o.direction || "up",
		vertical = rvertical.test( direction ),
		ref = vertical ? "height" : "width",
		ref2 = vertical ? "top" : "left",
		motion = rpositivemotion.test( direction ),
		animation = {},
		show = mode === "show",
		wrapper, distance, margin;

	// if already wrapped, the wrapper's properties are my property. #6245
	if ( el.parent().is( ".ui-effects-wrapper" ) ) {
		$.effects.save( el.parent(), props );
	} else {
		$.effects.save( el, props );
	}
	el.show();
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	distance = wrapper[ ref ]();
	margin = parseFloat( wrapper.css( ref2 ) ) || 0;

	animation[ ref ] = show ? distance : 0;
	if ( !motion ) {
		el
			.css( vertical ? "bottom" : "right", 0 )
			.css( vertical ? "top" : "left", "auto" )
			.css({ position: "absolute" });

		animation[ ref2 ] = show ? margin : distance + margin;
	}

	// start at 0 if we are showing
	if ( show ) {
		wrapper.css( ref, 0 );
		if ( !motion ) {
			wrapper.css( ref2, margin + distance );
		}
	}

	// Animate
	wrapper.animate( animation, {
		duration: o.duration,
		easing: o.easing,
		queue: false,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Bounce 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/bounce-effect/
 */


var effectBounce = $.effects.effect.bounce = function( o, done ) {
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],

		// defaults:
		mode = $.effects.setMode( el, o.mode || "effect" ),
		hide = mode === "hide",
		show = mode === "show",
		direction = o.direction || "up",
		distance = o.distance,
		times = o.times || 5,

		// number of internal animations
		anims = times * 2 + ( show || hide ? 1 : 0 ),
		speed = o.duration / anims,
		easing = o.easing,

		// utility:
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ),
		i,
		upAnim,
		downAnim,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	// Avoid touching opacity to prevent clearType and PNG issues in IE
	if ( show || hide ) {
		props.push( "opacity" );
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el ); // Create Wrapper

	// default distance for the BIGGEST bounce is the outer Distance / 3
	if ( !distance ) {
		distance = el[ ref === "top" ? "outerHeight" : "outerWidth" ]() / 3;
	}

	if ( show ) {
		downAnim = { opacity: 1 };
		downAnim[ ref ] = 0;

		// if we are showing, force opacity 0 and set the initial position
		// then do the "first" animation
		el.css( "opacity", 0 )
			.css( ref, motion ? -distance * 2 : distance * 2 )
			.animate( downAnim, speed, easing );
	}

	// start at the smallest distance if we are hiding
	if ( hide ) {
		distance = distance / Math.pow( 2, times - 1 );
	}

	downAnim = {};
	downAnim[ ref ] = 0;
	// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
	for ( i = 0; i < times; i++ ) {
		upAnim = {};
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing )
			.animate( downAnim, speed, easing );

		distance = hide ? distance * 2 : distance / 2;
	}

	// Last Bounce when Hiding
	if ( hide ) {
		upAnim = { opacity: 0 };
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing );
	}

	el.queue(function() {
		if ( hide ) {
			el.hide();
		}
		$.effects.restore( el, props );
		$.effects.removeWrapper( el );
		done();
	});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};


/*!
 * jQuery UI Effects Clip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/clip-effect/
 */


var effectClip = $.effects.effect.clip = function( o, done ) {
	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "vertical",
		vert = direction === "vertical",
		size = vert ? "height" : "width",
		position = vert ? "top" : "left",
		animation = {},
		wrapper, animate, distance;

	// Save & Show
	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	animate = ( el[0].tagName === "IMG" ) ? wrapper : el;
	distance = animate[ size ]();

	// Shift
	if ( show ) {
		animate.css( size, 0 );
		animate.css( position, distance / 2 );
	}

	// Create Animation Object:
	animation[ size ] = show ? distance : 0;
	animation[ position ] = show ? 0 : distance / 2;

	// Animate
	animate.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( !show ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});

};


/*!
 * jQuery UI Effects Drop 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/drop-effect/
 */


var effectDrop = $.effects.effect.drop = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "opacity", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ) ? "pos" : "neg",
		animation = {
			opacity: show ? 1 : 0
		},
		distance;

	// Adjust
	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true ) / 2;

	if ( show ) {
		el
			.css( "opacity", 0 )
			.css( ref, motion === "pos" ? -distance : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( motion === "pos" ? "+=" : "-=" ) :
		( motion === "pos" ? "-=" : "+=" ) ) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Explode 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/explode-effect/
 */


var effectExplode = $.effects.effect.explode = function( o, done ) {

	var rows = o.pieces ? Math.round( Math.sqrt( o.pieces ) ) : 3,
		cells = rows,
		el = $( this ),
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",

		// show and then visibility:hidden the element before calculating offset
		offset = el.show().css( "visibility", "hidden" ).offset(),

		// width and height of a piece
		width = Math.ceil( el.outerWidth() / cells ),
		height = Math.ceil( el.outerHeight() / rows ),
		pieces = [],

		// loop
		i, j, left, top, mx, my;

	// children animate complete:
	function childComplete() {
		pieces.push( this );
		if ( pieces.length === rows * cells ) {
			animComplete();
		}
	}

	// clone the element for each row and cell.
	for ( i = 0; i < rows ; i++ ) { // ===>
		top = offset.top + i * height;
		my = i - ( rows - 1 ) / 2 ;

		for ( j = 0; j < cells ; j++ ) { // |||
			left = offset.left + j * width;
			mx = j - ( cells - 1 ) / 2 ;

			// Create a clone of the now hidden main element that will be absolute positioned
			// within a wrapper div off the -left and -top equal to size of our pieces
			el
				.clone()
				.appendTo( "body" )
				.wrap( "<div></div>" )
				.css({
					position: "absolute",
					visibility: "visible",
					left: -j * width,
					top: -i * height
				})

			// select the wrapper - make it overflow: hidden and absolute positioned based on
			// where the original was located +left and +top equal to the size of pieces
				.parent()
				.addClass( "ui-effects-explode" )
				.css({
					position: "absolute",
					overflow: "hidden",
					width: width,
					height: height,
					left: left + ( show ? mx * width : 0 ),
					top: top + ( show ? my * height : 0 ),
					opacity: show ? 0 : 1
				}).animate({
					left: left + ( show ? 0 : mx * width ),
					top: top + ( show ? 0 : my * height ),
					opacity: show ? 1 : 0
				}, o.duration || 500, o.easing, childComplete );
		}
	}

	function animComplete() {
		el.css({
			visibility: "visible"
		});
		$( pieces ).remove();
		if ( !show ) {
			el.hide();
		}
		done();
	}
};


/*!
 * jQuery UI Effects Fade 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fade-effect/
 */


var effectFade = $.effects.effect.fade = function( o, done ) {
	var el = $( this ),
		mode = $.effects.setMode( el, o.mode || "toggle" );

	el.animate({
		opacity: mode
	}, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: done
	});
};


/*!
 * jQuery UI Effects Fold 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fold-effect/
 */


var effectFold = $.effects.effect.fold = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		hide = mode === "hide",
		size = o.size || 15,
		percent = /([0-9]+)%/.exec( size ),
		horizFirst = !!o.horizFirst,
		widthFirst = show !== horizFirst,
		ref = widthFirst ? [ "width", "height" ] : [ "height", "width" ],
		duration = o.duration / 2,
		wrapper, distance,
		animation1 = {},
		animation2 = {};

	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	distance = widthFirst ?
		[ wrapper.width(), wrapper.height() ] :
		[ wrapper.height(), wrapper.width() ];

	if ( percent ) {
		size = parseInt( percent[ 1 ], 10 ) / 100 * distance[ hide ? 0 : 1 ];
	}
	if ( show ) {
		wrapper.css( horizFirst ? {
			height: 0,
			width: size
		} : {
			height: size,
			width: 0
		});
	}

	// Animation
	animation1[ ref[ 0 ] ] = show ? distance[ 0 ] : size;
	animation2[ ref[ 1 ] ] = show ? distance[ 1 ] : 0;

	// Animate
	wrapper
		.animate( animation1, duration, o.easing )
		.animate( animation2, duration, o.easing, function() {
			if ( hide ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

};


/*!
 * jQuery UI Effects Highlight 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/highlight-effect/
 */


var effectHighlight = $.effects.effect.highlight = function( o, done ) {
	var elem = $( this ),
		props = [ "backgroundImage", "backgroundColor", "opacity" ],
		mode = $.effects.setMode( elem, o.mode || "show" ),
		animation = {
			backgroundColor: elem.css( "backgroundColor" )
		};

	if (mode === "hide") {
		animation.opacity = 0;
	}

	$.effects.save( elem, props );

	elem
		.show()
		.css({
			backgroundImage: "none",
			backgroundColor: o.color || "#ffff99"
		})
		.animate( animation, {
			queue: false,
			duration: o.duration,
			easing: o.easing,
			complete: function() {
				if ( mode === "hide" ) {
					elem.hide();
				}
				$.effects.restore( elem, props );
				done();
			}
		});
};


/*!
 * jQuery UI Effects Size 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/size-effect/
 */


var effectSize = $.effects.effect.size = function( o, done ) {

	// Create element
	var original, baseline, factor,
		el = $( this ),
		props0 = [ "position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity" ],

		// Always restore
		props1 = [ "position", "top", "bottom", "left", "right", "overflow", "opacity" ],

		// Copy for children
		props2 = [ "width", "height", "overflow" ],
		cProps = [ "fontSize" ],
		vProps = [ "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom" ],
		hProps = [ "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight" ],

		// Set options
		mode = $.effects.setMode( el, o.mode || "effect" ),
		restore = o.restore || mode !== "effect",
		scale = o.scale || "both",
		origin = o.origin || [ "middle", "center" ],
		position = el.css( "position" ),
		props = restore ? props0 : props1,
		zero = {
			height: 0,
			width: 0,
			outerHeight: 0,
			outerWidth: 0
		};

	if ( mode === "show" ) {
		el.show();
	}
	original = {
		height: el.height(),
		width: el.width(),
		outerHeight: el.outerHeight(),
		outerWidth: el.outerWidth()
	};

	if ( o.mode === "toggle" && mode === "show" ) {
		el.from = o.to || zero;
		el.to = o.from || original;
	} else {
		el.from = o.from || ( mode === "show" ? zero : original );
		el.to = o.to || ( mode === "hide" ? zero : original );
	}

	// Set scaling factor
	factor = {
		from: {
			y: el.from.height / original.height,
			x: el.from.width / original.width
		},
		to: {
			y: el.to.height / original.height,
			x: el.to.width / original.width
		}
	};

	// Scale the css box
	if ( scale === "box" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( vProps );
			el.from = $.effects.setTransition( el, vProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, vProps, factor.to.y, el.to );
		}

		// Horizontal props scaling
		if ( factor.from.x !== factor.to.x ) {
			props = props.concat( hProps );
			el.from = $.effects.setTransition( el, hProps, factor.from.x, el.from );
			el.to = $.effects.setTransition( el, hProps, factor.to.x, el.to );
		}
	}

	// Scale the content
	if ( scale === "content" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( cProps ).concat( props2 );
			el.from = $.effects.setTransition( el, cProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, cProps, factor.to.y, el.to );
		}
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );
	el.css( "overflow", "hidden" ).css( el.from );

	// Adjust
	if (origin) { // Calculate baseline shifts
		baseline = $.effects.getBaseline( origin, original );
		el.from.top = ( original.outerHeight - el.outerHeight() ) * baseline.y;
		el.from.left = ( original.outerWidth - el.outerWidth() ) * baseline.x;
		el.to.top = ( original.outerHeight - el.to.outerHeight ) * baseline.y;
		el.to.left = ( original.outerWidth - el.to.outerWidth ) * baseline.x;
	}
	el.css( el.from ); // set top & left

	// Animate
	if ( scale === "content" || scale === "both" ) { // Scale the children

		// Add margins/font-size
		vProps = vProps.concat([ "marginTop", "marginBottom" ]).concat(cProps);
		hProps = hProps.concat([ "marginLeft", "marginRight" ]);
		props2 = props0.concat(vProps).concat(hProps);

		el.find( "*[width]" ).each( function() {
			var child = $( this ),
				c_original = {
					height: child.height(),
					width: child.width(),
					outerHeight: child.outerHeight(),
					outerWidth: child.outerWidth()
				};
			if (restore) {
				$.effects.save(child, props2);
			}

			child.from = {
				height: c_original.height * factor.from.y,
				width: c_original.width * factor.from.x,
				outerHeight: c_original.outerHeight * factor.from.y,
				outerWidth: c_original.outerWidth * factor.from.x
			};
			child.to = {
				height: c_original.height * factor.to.y,
				width: c_original.width * factor.to.x,
				outerHeight: c_original.height * factor.to.y,
				outerWidth: c_original.width * factor.to.x
			};

			// Vertical props scaling
			if ( factor.from.y !== factor.to.y ) {
				child.from = $.effects.setTransition( child, vProps, factor.from.y, child.from );
				child.to = $.effects.setTransition( child, vProps, factor.to.y, child.to );
			}

			// Horizontal props scaling
			if ( factor.from.x !== factor.to.x ) {
				child.from = $.effects.setTransition( child, hProps, factor.from.x, child.from );
				child.to = $.effects.setTransition( child, hProps, factor.to.x, child.to );
			}

			// Animate children
			child.css( child.from );
			child.animate( child.to, o.duration, o.easing, function() {

				// Restore children
				if ( restore ) {
					$.effects.restore( child, props2 );
				}
			});
		});
	}

	// Animate
	el.animate( el.to, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( el.to.opacity === 0 ) {
				el.css( "opacity", el.from.opacity );
			}
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			if ( !restore ) {

				// we need to calculate our new positioning based on the scaling
				if ( position === "static" ) {
					el.css({
						position: "relative",
						top: el.to.top,
						left: el.to.left
					});
				} else {
					$.each([ "top", "left" ], function( idx, pos ) {
						el.css( pos, function( _, str ) {
							var val = parseInt( str, 10 ),
								toRef = idx ? el.to.left : el.to.top;

							// if original was "auto", recalculate the new value from wrapper
							if ( str === "auto" ) {
								return toRef + "px";
							}

							return val + toRef + "px";
						});
					});
				}
			}

			$.effects.removeWrapper( el );
			done();
		}
	});

};


/*!
 * jQuery UI Effects Scale 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/scale-effect/
 */


var effectScale = $.effects.effect.scale = function( o, done ) {

	// Create element
	var el = $( this ),
		options = $.extend( true, {}, o ),
		mode = $.effects.setMode( el, o.mode || "effect" ),
		percent = parseInt( o.percent, 10 ) ||
			( parseInt( o.percent, 10 ) === 0 ? 0 : ( mode === "hide" ? 0 : 100 ) ),
		direction = o.direction || "both",
		origin = o.origin,
		original = {
			height: el.height(),
			width: el.width(),
			outerHeight: el.outerHeight(),
			outerWidth: el.outerWidth()
		},
		factor = {
			y: direction !== "horizontal" ? (percent / 100) : 1,
			x: direction !== "vertical" ? (percent / 100) : 1
		};

	// We are going to pass this effect to the size effect:
	options.effect = "size";
	options.queue = false;
	options.complete = done;

	// Set default origin and restore for show/hide
	if ( mode !== "effect" ) {
		options.origin = origin || [ "middle", "center" ];
		options.restore = true;
	}

	options.from = o.from || ( mode === "show" ? {
		height: 0,
		width: 0,
		outerHeight: 0,
		outerWidth: 0
	} : original );
	options.to = {
		height: original.height * factor.y,
		width: original.width * factor.x,
		outerHeight: original.outerHeight * factor.y,
		outerWidth: original.outerWidth * factor.x
	};

	// Fade option to support puff
	if ( options.fade ) {
		if ( mode === "show" ) {
			options.from.opacity = 0;
			options.to.opacity = 1;
		}
		if ( mode === "hide" ) {
			options.from.opacity = 1;
			options.to.opacity = 0;
		}
	}

	// Animate
	el.effect( options );

};


/*!
 * jQuery UI Effects Puff 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/puff-effect/
 */


var effectPuff = $.effects.effect.puff = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "hide" ),
		hide = mode === "hide",
		percent = parseInt( o.percent, 10 ) || 150,
		factor = percent / 100,
		original = {
			height: elem.height(),
			width: elem.width(),
			outerHeight: elem.outerHeight(),
			outerWidth: elem.outerWidth()
		};

	$.extend( o, {
		effect: "scale",
		queue: false,
		fade: true,
		mode: mode,
		complete: done,
		percent: hide ? percent : 100,
		from: hide ?
			original :
			{
				height: original.height * factor,
				width: original.width * factor,
				outerHeight: original.outerHeight * factor,
				outerWidth: original.outerWidth * factor
			}
	});

	elem.effect( o );
};


/*!
 * jQuery UI Effects Pulsate 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/pulsate-effect/
 */


var effectPulsate = $.effects.effect.pulsate = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "show" ),
		show = mode === "show",
		hide = mode === "hide",
		showhide = ( show || mode === "hide" ),

		// showing or hiding leaves of the "last" animation
		anims = ( ( o.times || 5 ) * 2 ) + ( showhide ? 1 : 0 ),
		duration = o.duration / anims,
		animateTo = 0,
		queue = elem.queue(),
		queuelen = queue.length,
		i;

	if ( show || !elem.is(":visible")) {
		elem.css( "opacity", 0 ).show();
		animateTo = 1;
	}

	// anims - 1 opacity "toggles"
	for ( i = 1; i < anims; i++ ) {
		elem.animate({
			opacity: animateTo
		}, duration, o.easing );
		animateTo = 1 - animateTo;
	}

	elem.animate({
		opacity: animateTo
	}, duration, o.easing);

	elem.queue(function() {
		if ( hide ) {
			elem.hide();
		}
		done();
	});

	// We just queued up "anims" animations, we need to put them next in the queue
	if ( queuelen > 1 ) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	elem.dequeue();
};


/*!
 * jQuery UI Effects Shake 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/shake-effect/
 */


var effectShake = $.effects.effect.shake = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "effect" ),
		direction = o.direction || "left",
		distance = o.distance || 20,
		times = o.times || 3,
		anims = times * 2 + 1,
		speed = Math.round( o.duration / anims ),
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		animation = {},
		animation1 = {},
		animation2 = {},
		i,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	// Animation
	animation[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance;
	animation1[ ref ] = ( positiveMotion ? "+=" : "-=" ) + distance * 2;
	animation2[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance * 2;

	// Animate
	el.animate( animation, speed, o.easing );

	// Shakes
	for ( i = 1; i < times; i++ ) {
		el.animate( animation1, speed, o.easing ).animate( animation2, speed, o.easing );
	}
	el
		.animate( animation1, speed, o.easing )
		.animate( animation, speed / 2, o.easing )
		.queue(function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};


/*!
 * jQuery UI Effects Slide 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slide-effect/
 */


var effectSlide = $.effects.effect.slide = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "width", "height" ],
		mode = $.effects.setMode( el, o.mode || "show" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		distance,
		animation = {};

	// Adjust
	$.effects.save( el, props );
	el.show();
	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true );

	$.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	if ( show ) {
		el.css( ref, positiveMotion ? (isNaN(distance) ? "-" + distance : -distance) : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( positiveMotion ? "+=" : "-=") :
		( positiveMotion ? "-=" : "+=")) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Transfer 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/transfer-effect/
 */


var effectTransfer = $.effects.effect.transfer = function( o, done ) {
	var elem = $( this ),
		target = $( o.to ),
		targetFixed = target.css( "position" ) === "fixed",
		body = $("body"),
		fixTop = targetFixed ? body.scrollTop() : 0,
		fixLeft = targetFixed ? body.scrollLeft() : 0,
		endPosition = target.offset(),
		animation = {
			top: endPosition.top - fixTop,
			left: endPosition.left - fixLeft,
			height: target.innerHeight(),
			width: target.innerWidth()
		},
		startPosition = elem.offset(),
		transfer = $( "<div class='ui-effects-transfer'></div>" )
			.appendTo( document.body )
			.addClass( o.className )
			.css({
				top: startPosition.top - fixTop,
				left: startPosition.left - fixLeft,
				height: elem.innerHeight(),
				width: elem.innerWidth(),
				position: targetFixed ? "fixed" : "absolute"
			})
			.animate( animation, o.duration, o.easing, function() {
				transfer.remove();
				done();
			});
};


/*!
 * jQuery UI Progressbar 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/progressbar/
 */


var progressbar = $.widget( "ui.progressbar", {
	version: "1.11.4",
	options: {
		max: 100,
		value: 0,

		change: null,
		complete: null
	},

	min: 0,

	_create: function() {
		// Constrain initial value
		this.oldValue = this.options.value = this._constrainedValue();

		this.element
			.addClass( "ui-progressbar ui-widget ui-widget-content ui-corner-all" )
			.attr({
				// Only set static values, aria-valuenow and aria-valuemax are
				// set inside _refreshValue()
				role: "progressbar",
				"aria-valuemin": this.min
			});

		this.valueDiv = $( "<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>" )
			.appendTo( this.element );

		this._refreshValue();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-progressbar ui-widget ui-widget-content ui-corner-all" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );

		this.valueDiv.remove();
	},

	value: function( newValue ) {
		if ( newValue === undefined ) {
			return this.options.value;
		}

		this.options.value = this._constrainedValue( newValue );
		this._refreshValue();
	},

	_constrainedValue: function( newValue ) {
		if ( newValue === undefined ) {
			newValue = this.options.value;
		}

		this.indeterminate = newValue === false;

		// sanitize value
		if ( typeof newValue !== "number" ) {
			newValue = 0;
		}

		return this.indeterminate ? false :
			Math.min( this.options.max, Math.max( this.min, newValue ) );
	},

	_setOptions: function( options ) {
		// Ensure "value" option is set after other values (like max)
		var value = options.value;
		delete options.value;

		this._super( options );

		this.options.value = this._constrainedValue( value );
		this._refreshValue();
	},

	_setOption: function( key, value ) {
		if ( key === "max" ) {
			// Don't allow a max less than min
			value = Math.max( this.min, value );
		}
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
		}
		this._super( key, value );
	},

	_percentage: function() {
		return this.indeterminate ? 100 : 100 * ( this.options.value - this.min ) / ( this.options.max - this.min );
	},

	_refreshValue: function() {
		var value = this.options.value,
			percentage = this._percentage();

		this.valueDiv
			.toggle( this.indeterminate || value > this.min )
			.toggleClass( "ui-corner-right", value === this.options.max )
			.width( percentage.toFixed(0) + "%" );

		this.element.toggleClass( "ui-progressbar-indeterminate", this.indeterminate );

		if ( this.indeterminate ) {
			this.element.removeAttr( "aria-valuenow" );
			if ( !this.overlayDiv ) {
				this.overlayDiv = $( "<div class='ui-progressbar-overlay'></div>" ).appendTo( this.valueDiv );
			}
		} else {
			this.element.attr({
				"aria-valuemax": this.options.max,
				"aria-valuenow": value
			});
			if ( this.overlayDiv ) {
				this.overlayDiv.remove();
				this.overlayDiv = null;
			}
		}

		if ( this.oldValue !== value ) {
			this.oldValue = value;
			this._trigger( "change" );
		}
		if ( value === this.options.max ) {
			this._trigger( "complete" );
		}
	}
});


/*!
 * jQuery UI Selectable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectable/
 */


var selectable = $.widget("ui.selectable", $.ui.mouse, {
	version: "1.11.4",
	options: {
		appendTo: "body",
		autoRefresh: true,
		distance: 0,
		filter: "*",
		tolerance: "touch",

		// callbacks
		selected: null,
		selecting: null,
		start: null,
		stop: null,
		unselected: null,
		unselecting: null
	},
	_create: function() {
		var selectees,
			that = this;

		this.element.addClass("ui-selectable");

		this.dragged = false;

		// cache selectee children based on filter
		this.refresh = function() {
			selectees = $(that.options.filter, that.element[0]);
			selectees.addClass("ui-selectee");
			selectees.each(function() {
				var $this = $(this),
					pos = $this.offset();
				$.data(this, "selectable-item", {
					element: this,
					$element: $this,
					left: pos.left,
					top: pos.top,
					right: pos.left + $this.outerWidth(),
					bottom: pos.top + $this.outerHeight(),
					startselected: false,
					selected: $this.hasClass("ui-selected"),
					selecting: $this.hasClass("ui-selecting"),
					unselecting: $this.hasClass("ui-unselecting")
				});
			});
		};
		this.refresh();

		this.selectees = selectees.addClass("ui-selectee");

		this._mouseInit();

		this.helper = $("<div class='ui-selectable-helper'></div>");
	},

	_destroy: function() {
		this.selectees
			.removeClass("ui-selectee")
			.removeData("selectable-item");
		this.element
			.removeClass("ui-selectable ui-selectable-disabled");
		this._mouseDestroy();
	},

	_mouseStart: function(event) {
		var that = this,
			options = this.options;

		this.opos = [ event.pageX, event.pageY ];

		if (this.options.disabled) {
			return;
		}

		this.selectees = $(options.filter, this.element[0]);

		this._trigger("start", event);

		$(options.appendTo).append(this.helper);
		// position helper (lasso)
		this.helper.css({
			"left": event.pageX,
			"top": event.pageY,
			"width": 0,
			"height": 0
		});

		if (options.autoRefresh) {
			this.refresh();
		}

		this.selectees.filter(".ui-selected").each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.startselected = true;
			if (!event.metaKey && !event.ctrlKey) {
				selectee.$element.removeClass("ui-selected");
				selectee.selected = false;
				selectee.$element.addClass("ui-unselecting");
				selectee.unselecting = true;
				// selectable UNSELECTING callback
				that._trigger("unselecting", event, {
					unselecting: selectee.element
				});
			}
		});

		$(event.target).parents().addBack().each(function() {
			var doSelect,
				selectee = $.data(this, "selectable-item");
			if (selectee) {
				doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("ui-selected");
				selectee.$element
					.removeClass(doSelect ? "ui-unselecting" : "ui-selected")
					.addClass(doSelect ? "ui-selecting" : "ui-unselecting");
				selectee.unselecting = !doSelect;
				selectee.selecting = doSelect;
				selectee.selected = doSelect;
				// selectable (UN)SELECTING callback
				if (doSelect) {
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				} else {
					that._trigger("unselecting", event, {
						unselecting: selectee.element
					});
				}
				return false;
			}
		});

	},

	_mouseDrag: function(event) {

		this.dragged = true;

		if (this.options.disabled) {
			return;
		}

		var tmp,
			that = this,
			options = this.options,
			x1 = this.opos[0],
			y1 = this.opos[1],
			x2 = event.pageX,
			y2 = event.pageY;

		if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
		if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
		this.helper.css({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 });

		this.selectees.each(function() {
			var selectee = $.data(this, "selectable-item"),
				hit = false;

			//prevent helper from being selected if appendTo: selectable
			if (!selectee || selectee.element === that.element[0]) {
				return;
			}

			if (options.tolerance === "touch") {
				hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
			} else if (options.tolerance === "fit") {
				hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
			}

			if (hit) {
				// SELECT
				if (selectee.selected) {
					selectee.$element.removeClass("ui-selected");
					selectee.selected = false;
				}
				if (selectee.unselecting) {
					selectee.$element.removeClass("ui-unselecting");
					selectee.unselecting = false;
				}
				if (!selectee.selecting) {
					selectee.$element.addClass("ui-selecting");
					selectee.selecting = true;
					// selectable SELECTING callback
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				}
			} else {
				// UNSELECT
				if (selectee.selecting) {
					if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						selectee.$element.addClass("ui-selected");
						selectee.selected = true;
					} else {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						if (selectee.startselected) {
							selectee.$element.addClass("ui-unselecting");
							selectee.unselecting = true;
						}
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
				if (selectee.selected) {
					if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
						selectee.$element.removeClass("ui-selected");
						selectee.selected = false;

						selectee.$element.addClass("ui-unselecting");
						selectee.unselecting = true;
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
			}
		});

		return false;
	},

	_mouseStop: function(event) {
		var that = this;

		this.dragged = false;

		$(".ui-unselecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-unselecting");
			selectee.unselecting = false;
			selectee.startselected = false;
			that._trigger("unselected", event, {
				unselected: selectee.element
			});
		});
		$(".ui-selecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-selecting").addClass("ui-selected");
			selectee.selecting = false;
			selectee.selected = true;
			selectee.startselected = true;
			that._trigger("selected", event, {
				selected: selectee.element
			});
		});
		this._trigger("stop", event);

		this.helper.remove();

		return false;
	}

});


/*!
 * jQuery UI Selectmenu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectmenu
 */


var selectmenu = $.widget( "ui.selectmenu", {
	version: "1.11.4",
	defaultElement: "<select>",
	options: {
		appendTo: null,
		disabled: null,
		icons: {
			button: "ui-icon-triangle-1-s"
		},
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		width: null,

		// callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		select: null
	},

	_create: function() {
		var selectmenuId = this.element.uniqueId().attr( "id" );
		this.ids = {
			element: selectmenuId,
			button: selectmenuId + "-button",
			menu: selectmenuId + "-menu"
		};

		this._drawButton();
		this._drawMenu();

		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_drawButton: function() {
		var that = this;

		// Associate existing label with the new button
		this.label = $( "label[for='" + this.ids.element + "']" ).attr( "for", this.ids.button );
		this._on( this.label, {
			click: function( event ) {
				this.button.focus();
				event.preventDefault();
			}
		});

		// Hide original select element
		this.element.hide();

		// Create button
		this.button = $( "<span>", {
			"class": "ui-selectmenu-button ui-widget ui-state-default ui-corner-all",
			tabindex: this.options.disabled ? -1 : 0,
			id: this.ids.button,
			role: "combobox",
			"aria-expanded": "false",
			"aria-autocomplete": "list",
			"aria-owns": this.ids.menu,
			"aria-haspopup": "true"
		})
			.insertAfter( this.element );

		$( "<span>", {
			"class": "ui-icon " + this.options.icons.button
		})
			.prependTo( this.button );

		this.buttonText = $( "<span>", {
			"class": "ui-selectmenu-text"
		})
			.appendTo( this.button );

		this._setText( this.buttonText, this.element.find( "option:selected" ).text() );
		this._resizeButton();

		this._on( this.button, this._buttonEvents );
		this.button.one( "focusin", function() {

			// Delay rendering the menu items until the button receives focus.
			// The menu may have already been rendered via a programmatic open.
			if ( !that.menuItems ) {
				that._refreshMenu();
			}
		});
		this._hoverable( this.button );
		this._focusable( this.button );
	},

	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		});

		// Wrap menu
		this.menuWrap = $( "<div>", {
			"class": "ui-selectmenu-menu ui-front"
		})
			.append( this.menu )
			.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu({
				role: "listbox",
				select: function( event, ui ) {
					event.preventDefault();

					// support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
					that._setSelection();

					that._select( ui.item.data( "ui-selectmenu-item" ), event );
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			})
			.menu( "instance" );

		// Adjust menu styles to dropdown
		this.menu
			.addClass( "ui-corner-bottom" )
			.removeClass( "ui-corner-all" );

		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};
	},

	refresh: function() {
		this._refreshMenu();
		this._setText( this.buttonText, this._getSelectedItem().text() );
		if ( !this.options.width ) {
			this._resizeButton();
		}
	},

	_refreshMenu: function() {
		this.menu.empty();

		var item,
			options = this.element.find( "option" );

		if ( !options.length ) {
			return;
		}

		this._parseOptions( options );
		this._renderMenu( this.menu, this.items );

		this.menuInstance.refresh();
		this.menuItems = this.menu.find( "li" ).not( ".ui-selectmenu-optgroup" );

		item = this._getSelectedItem();

		// Update the menu to have the correct item focused
		this.menuInstance.focus( null, item );
		this._setAria( item.data( "ui-selectmenu-item" ) );

		// Set disabled state
		this._setOption( "disabled", this.element.prop( "disabled" ) );
	},

	open: function( event ) {
		if ( this.options.disabled ) {
			return;
		}

		// If this is the first time the menu is being opened, render the items
		if ( !this.menuItems ) {
			this._refreshMenu();
		} else {

			// Menu clears focus on close, reset focus to selected item
			this.menu.find( ".ui-state-focus" ).removeClass( "ui-state-focus" );
			this.menuInstance.focus( null, this._getSelectedItem() );
		}

		this.isOpen = true;
		this._toggleAttr();
		this._resizeMenu();
		this._position();

		this._on( this.document, this._documentClick );

		this._trigger( "open", event );
	},

	_position: function() {
		this.menuWrap.position( $.extend( { of: this.button }, this.options.position ) );
	},

	close: function( event ) {
		if ( !this.isOpen ) {
			return;
		}

		this.isOpen = false;
		this._toggleAttr();

		this.range = null;
		this._off( this.document );

		this._trigger( "close", event );
	},

	widget: function() {
		return this.button;
	},

	menuWidget: function() {
		return this.menu;
	},

	_renderMenu: function( ul, items ) {
		var that = this,
			currentOptgroup = "";

		$.each( items, function( index, item ) {
			if ( item.optgroup !== currentOptgroup ) {
				$( "<li>", {
					"class": "ui-selectmenu-optgroup ui-menu-divider" +
						( item.element.parent( "optgroup" ).prop( "disabled" ) ?
							" ui-state-disabled" :
							"" ),
					text: item.optgroup
				})
					.appendTo( ul );

				currentOptgroup = item.optgroup;
			}

			that._renderItemData( ul, item );
		});
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-selectmenu-item", item );
	},

	_renderItem: function( ul, item ) {
		var li = $( "<li>" );

		if ( item.disabled ) {
			li.addClass( "ui-state-disabled" );
		}
		this._setText( li, item.label );

		return li.appendTo( ul );
	},

	_setText: function( element, value ) {
		if ( value ) {
			element.text( value );
		} else {
			element.html( "&#160;" );
		}
	},

	_move: function( direction, event ) {
		var item, next,
			filter = ".ui-menu-item";

		if ( this.isOpen ) {
			item = this.menuItems.eq( this.focusIndex );
		} else {
			item = this.menuItems.eq( this.element[ 0 ].selectedIndex );
			filter += ":not(.ui-state-disabled)";
		}

		if ( direction === "first" || direction === "last" ) {
			next = item[ direction === "first" ? "prevAll" : "nextAll" ]( filter ).eq( -1 );
		} else {
			next = item[ direction + "All" ]( filter ).eq( 0 );
		}

		if ( next.length ) {
			this.menuInstance.focus( event, next );
		}
	},

	_getSelectedItem: function() {
		return this.menuItems.eq( this.element[ 0 ].selectedIndex );
	},

	_toggle: function( event ) {
		this[ this.isOpen ? "close" : "open" ]( event );
	},

	_setSelection: function() {
		var selection;

		if ( !this.range ) {
			return;
		}

		if ( window.getSelection ) {
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.range );

		// support: IE8
		} else {
			this.range.select();
		}

		// support: IE
		// Setting the text selection kills the button focus in IE, but
		// restoring the focus doesn't kill the selection.
		this.button.focus();
	},

	_documentClick: {
		mousedown: function( event ) {
			if ( !this.isOpen ) {
				return;
			}

			if ( !$( event.target ).closest( ".ui-selectmenu-menu, #" + this.ids.button ).length ) {
				this.close( event );
			}
		}
	},

	_buttonEvents: {

		// Prevent text selection from being reset when interacting with the selectmenu (#10144)
		mousedown: function() {
			var selection;

			if ( window.getSelection ) {
				selection = window.getSelection();
				if ( selection.rangeCount ) {
					this.range = selection.getRangeAt( 0 );
				}

			// support: IE8
			} else {
				this.range = document.selection.createRange();
			}
		},

		click: function( event ) {
			this._setSelection();
			this._toggle( event );
		},

		keydown: function( event ) {
			var preventDefault = true;
			switch ( event.keyCode ) {
				case $.ui.keyCode.TAB:
				case $.ui.keyCode.ESCAPE:
					this.close( event );
					preventDefault = false;
					break;
				case $.ui.keyCode.ENTER:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					}
					break;
				case $.ui.keyCode.UP:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "prev", event );
					}
					break;
				case $.ui.keyCode.DOWN:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "next", event );
					}
					break;
				case $.ui.keyCode.SPACE:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					} else {
						this._toggle( event );
					}
					break;
				case $.ui.keyCode.LEFT:
					this._move( "prev", event );
					break;
				case $.ui.keyCode.RIGHT:
					this._move( "next", event );
					break;
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.PAGE_UP:
					this._move( "first", event );
					break;
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_DOWN:
					this._move( "last", event );
					break;
				default:
					this.menu.trigger( event );
					preventDefault = false;
			}

			if ( preventDefault ) {
				event.preventDefault();
			}
		}
	},

	_selectFocusedItem: function( event ) {
		var item = this.menuItems.eq( this.focusIndex );
		if ( !item.hasClass( "ui-state-disabled" ) ) {
			this._select( item.data( "ui-selectmenu-item" ), event );
		}
	},

	_select: function( item, event ) {
		var oldIndex = this.element[ 0 ].selectedIndex;

		// Change native select element
		this.element[ 0 ].selectedIndex = item.index;
		this._setText( this.buttonText, item.label );
		this._setAria( item );
		this._trigger( "select", event, { item: item } );

		if ( item.index !== oldIndex ) {
			this._trigger( "change", event, { item: item } );
		}

		this.close( event );
	},

	_setAria: function( item ) {
		var id = this.menuItems.eq( item.index ).attr( "id" );

		this.button.attr({
			"aria-labelledby": id,
			"aria-activedescendant": id
		});
		this.menu.attr( "aria-activedescendant", id );
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.button.find( "span.ui-icon" )
				.removeClass( this.options.icons.button )
				.addClass( value.button );
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.menuWrap.appendTo( this._appendTo() );
		}

		if ( key === "disabled" ) {
			this.menuInstance.option( "disabled", value );
			this.button
				.toggleClass( "ui-state-disabled", value )
				.attr( "aria-disabled", value );

			this.element.prop( "disabled", value );
			if ( value ) {
				this.button.attr( "tabindex", -1 );
				this.close();
			} else {
				this.button.attr( "tabindex", 0 );
			}
		}

		if ( key === "width" ) {
			this._resizeButton();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_toggleAttr: function() {
		this.button
			.toggleClass( "ui-corner-top", this.isOpen )
			.toggleClass( "ui-corner-all", !this.isOpen )
			.attr( "aria-expanded", this.isOpen );
		this.menuWrap.toggleClass( "ui-selectmenu-open", this.isOpen );
		this.menu.attr( "aria-hidden", !this.isOpen );
	},

	_resizeButton: function() {
		var width = this.options.width;

		if ( !width ) {
			width = this.element.show().outerWidth();
			this.element.hide();
		}

		this.button.outerWidth( width );
	},

	_resizeMenu: function() {
		this.menu.outerWidth( Math.max(
			this.button.outerWidth(),

			// support: IE10
			// IE10 wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping
			this.menu.width( "" ).outerWidth() + 1
		) );
	},

	_getCreateOptions: function() {
		return { disabled: this.element.prop( "disabled" ) };
	},

	_parseOptions: function( options ) {
		var data = [];
		options.each(function( index, item ) {
			var option = $( item ),
				optgroup = option.parent( "optgroup" );
			data.push({
				element: option,
				index: index,
				value: option.val(),
				label: option.text(),
				optgroup: optgroup.attr( "label" ) || "",
				disabled: optgroup.prop( "disabled" ) || option.prop( "disabled" )
			});
		});
		this.items = data;
	},

	_destroy: function() {
		this.menuWrap.remove();
		this.button.remove();
		this.element.show();
		this.element.removeUniqueId();
		this.label.attr( "for", this.ids.element );
	}
});


/*!
 * jQuery UI Slider 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slider/
 */


var slider = $.widget( "ui.slider", $.ui.mouse, {
	version: "1.11.4",
	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null,

		// callbacks
		change: null,
		slide: null,
		start: null,
		stop: null
	},

	// number of pages in a slider
	// (how many times can you page up/down to go through the whole range)
	numPages: 5,

	_create: function() {
		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();
		this._calculateNewMax();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all");

		this._refresh();
		this._setOption( "disabled", this.options.disabled );

		this._animateOff = false;
	},

	_refresh: function() {
		this._createRange();
		this._createHandles();
		this._setupEvents();
		this._refreshValue();
	},

	_createHandles: function() {
		var i, handleCount,
			options = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",
			handles = [];

		handleCount = ( options.values && options.values.length ) || 1;

		if ( existingHandles.length > handleCount ) {
			existingHandles.slice( handleCount ).remove();
			existingHandles = existingHandles.slice( 0, handleCount );
		}

		for ( i = existingHandles.length; i < handleCount; i++ ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.each(function( i ) {
			$( this ).data( "ui-slider-handle-index", i );
		});
	},

	_createRange: function() {
		var options = this.options,
			classes = "";

		if ( options.range ) {
			if ( options.range === true ) {
				if ( !options.values ) {
					options.values = [ this._valueMin(), this._valueMin() ];
				} else if ( options.values.length && options.values.length !== 2 ) {
					options.values = [ options.values[0], options.values[0] ];
				} else if ( $.isArray( options.values ) ) {
					options.values = options.values.slice(0);
				}
			}

			if ( !this.range || !this.range.length ) {
				this.range = $( "<div></div>" )
					.appendTo( this.element );

				classes = "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header ui-corner-all";
			} else {
				this.range.removeClass( "ui-slider-range-min ui-slider-range-max" )
					// Handle range switching from true to min/max
					.css({
						"left": "",
						"bottom": ""
					});
			}

			this.range.addClass( classes +
				( ( options.range === "min" || options.range === "max" ) ? " ui-slider-range-" + options.range : "" ) );
		} else {
			if ( this.range ) {
				this.range.remove();
			}
			this.range = null;
		}
	},

	_setupEvents: function() {
		this._off( this.handles );
		this._on( this.handles, this._handleEvents );
		this._hoverable( this.handles );
		this._focusable( this.handles );
	},

	_destroy: function() {
		this.handles.remove();
		if ( this.range ) {
			this.range.remove();
		}

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );

		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
			that = this,
			o = this.options;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - that.values(i) );
			if (( distance > thisDistance ) ||
				( distance === thisDistance &&
					(i === that._lastChangedValue || that.values(i) === o.min ))) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		this._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();

		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().addBack().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function() {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );

		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},

	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) &&
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			//store the last changed value index for reference when handles overlap
			this._lastChangedValue = index;

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( key === "range" && this.options.range === true ) {
			if ( value === "min" ) {
				this.options.value = this._values( 0 );
				this.options.values = null;
			} else if ( value === "max" ) {
				this.options.value = this._values( this.options.values.length - 1 );
				this.options.values = null;
			}
		}

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		if ( key === "disabled" ) {
			this.element.toggleClass( "ui-state-disabled", !!value );
		}

		this._super( key, value );

		switch ( key ) {
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();

				// Reset positioning from previous orientation
				this.handles.css( value === "horizontal" ? "bottom" : "left", "" );
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
			case "step":
			case "min":
			case "max":
				this._animateOff = true;
				this._calculateNewMax();
				this._refreshValue();
				this._animateOff = false;
				break;
			case "range":
				this._animateOff = true;
				this._refresh();
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else if ( this.options.values && this.options.values.length ) {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i += 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		} else {
			return [];
		}
	},

	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_calculateNewMax: function() {
		var max = this.options.max,
			min = this._valueMin(),
			step = this.options.step,
			aboveMin = Math.floor( ( +( max - min ).toFixed( this._precision() ) ) / step ) * step;
		max = aboveMin + min;
		this.max = parseFloat( max.toFixed( this._precision() ) );
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.max;
	},

	_refreshValue: function() {
		var lastValPercent, valPercent, value, valueMin, valueMax,
			oRange = this.options.range,
			o = this.options,
			that = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			_set = {};

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i ) {
				valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
				_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( that.options.range === true ) {
					if ( that.orientation === "horizontal" ) {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	},

	_handleEvents: {
		keydown: function( event ) {
			var allowed, curVal, newVal, step,
				index = $( event.target ).data( "ui-slider-handle-index" );

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_UP:
				case $.ui.keyCode.PAGE_DOWN:
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					event.preventDefault();
					if ( !this._keySliding ) {
						this._keySliding = true;
						$( event.target ).addClass( "ui-state-active" );
						allowed = this._start( event, index );
						if ( allowed === false ) {
							return;
						}
					}
					break;
			}

			step = this.options.step;
			if ( this.options.values && this.options.values.length ) {
				curVal = newVal = this.values( index );
			} else {
				curVal = newVal = this.value();
			}

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
					newVal = this._valueMin();
					break;
				case $.ui.keyCode.END:
					newVal = this._valueMax();
					break;
				case $.ui.keyCode.PAGE_UP:
					newVal = this._trimAlignValue(
						curVal + ( ( this._valueMax() - this._valueMin() ) / this.numPages )
					);
					break;
				case $.ui.keyCode.PAGE_DOWN:
					newVal = this._trimAlignValue(
						curVal - ( (this._valueMax() - this._valueMin()) / this.numPages ) );
					break;
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
					if ( curVal === this._valueMax() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal + step );
					break;
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					if ( curVal === this._valueMin() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal - step );
					break;
			}

			this._slide( event, index, newVal );
		},
		keyup: function( event ) {
			var index = $( event.target ).data( "ui-slider-handle-index" );

			if ( this._keySliding ) {
				this._keySliding = false;
				this._stop( event, index );
				this._change( event, index );
				$( event.target ).removeClass( "ui-state-active" );
			}
		}
	}
});


/*!
 * jQuery UI Sortable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 */


var sortable = $.widget("ui.sortable", $.ui.mouse, {
	version: "1.11.4",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: "> *",
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000,

		// callbacks
		activate: null,
		beforeStop: null,
		change: null,
		deactivate: null,
		out: null,
		over: null,
		receive: null,
		remove: null,
		sort: null,
		start: null,
		stop: null,
		update: null
	},

	_isOverAxis: function( x, reference, size ) {
		return ( x >= reference ) && ( x < ( reference + size ) );
	},

	_isFloating: function( item ) {
		return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
	},

	_create: function() {
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		this._setHandleClassName();

		//We're ready to go
		this.ready = true;

	},

	_setOption: function( key, value ) {
		this._super( key, value );

		if ( key === "handle" ) {
			this._setHandleClassName();
		}
	},

	_setHandleClassName: function() {
		this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
		$.each( this.items, function() {
			( this.instance.options.handle ?
				this.item.find( this.instance.options.handle ) : this.item )
				.addClass( "ui-sortable-handle" );
		});
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-sortable ui-sortable-disabled" )
			.find( ".ui-sortable-handle" )
				.removeClass( "ui-sortable-handle" );
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- ) {
			this.items[i].item.removeData(this.widgetName + "-item");
		}

		return this;
	},

	_mouseCapture: function(event, overrideHandle) {
		var currentItem = null,
			validHandle = false,
			that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type === "static") {
			return false;
		}

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + "-item") === that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + "-item") === that) {
			currentItem = $(event.target);
		}

		if(!currentItem) {
			return false;
		}
		if(this.options.handle && !overrideHandle) {
			$(this.options.handle, currentItem).find("*").addBack().each(function() {
				if(this === event.target) {
					validHandle = true;
				}
			});
			if(!validHandle) {
				return false;
			}
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var i, body,
			o = this.options;

		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] !== this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment) {
			this._setContainment();
		}

		if( o.cursor && o.cursor !== "auto" ) { // cursor option
			body = this.document.find( "body" );

			// support: IE
			this.storedCursor = body.css( "cursor" );
			body.css( "cursor", o.cursor );

			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) {
				this._storedOpacity = this.helper.css("opacity");
			}
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) {
				this._storedZIndex = this.helper.css("zIndex");
			}
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
			this.overflowOffset = this.scrollParent.offset();
		}

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions) {
			this._cacheHelperProportions();
		}


		//Post "activate" events to possible containers
		if( !noActivation ) {
			for ( i = this.containers.length - 1; i >= 0; i-- ) {
				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
			}
		}

		//Prepare possible droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {
		var i, item, itemElement, intersection,
			o = this.options,
			scrolled = false;

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
				}

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
				}

			} else {

				if(event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
					scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
				} else if(this.window.height() - (event.pageY - this.document.scrollTop()) < o.scrollSensitivity) {
					scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
				}

				if(event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
					scrolled = this.document.scrollLeft(this.document.scrollLeft() - o.scrollSpeed);
				} else if(this.window.width() - (event.pageX - this.document.scrollLeft()) < o.scrollSensitivity) {
					scrolled = this.document.scrollLeft(this.document.scrollLeft() + o.scrollSpeed);
				}

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
				$.ui.ddmanager.prepareOffsets(this, event);
			}
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}

		//Rearrange
		for (i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			item = this.items[i];
			itemElement = item.item[0];
			intersection = this._intersectsWithPointer(item);
			if (!intersection) {
				continue;
			}

			// Only put the placeholder inside the current Container, skip all
			// items from other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this, moving items in "sub-sortables" can cause
			// the placeholder to jitter between the outer and inner container.
			if (item.instance !== this.currentContainer) {
				continue;
			}

			// cannot intersect with itself
			// no useless actions that have been done before
			// no action if the item moved is the parent of the item checked
			if (itemElement !== this.currentItem[0] &&
				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
				!$.contains(this.placeholder[0], itemElement) &&
				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection === 1 ? "down" : "up";

				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		//Call callbacks
		this._trigger("sort", event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) {
			return;
		}

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			$.ui.ddmanager.drop(this, event);
		}

		if(this.options.revert) {
			var that = this,
				cur = this.placeholder.offset(),
				axis = this.options.axis,
				animation = {};

			if ( !axis || axis === "x" ) {
				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft);
			}
			if ( !axis || axis === "y" ) {
				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop);
			}
			this.reverting = true;
			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper === "original") {
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			} else {
				this.currentItem.show();
			}

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) {
				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			}
			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
				this.helper.remove();
			}

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			str = [];
		o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
			if (res) {
				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
			}
		});

		if(!str.length && o.key) {
			str.push(o.key + "=");
		}

		return str.join("&");

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			ret = [];

		o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height,
			l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height,
			dyClick = this.offset.click.top,
			dxClick = this.offset.click.left,
			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
			isOverElement = isOverElementHeight && isOverElementWidth;

		if ( this.options.tolerance === "pointer" ||
			this.options.forcePointerForContainers ||
			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
				x2 - (this.helperProportions.width / 2) < r && // Left Half
				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
				y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement) {
			return false;
		}

		return this.floating ?
			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this._setHandleClassName();
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var i, j, cur, inst,
			items = [],
			queries = [],
			connectWith = this._connectWith();

		if(connectWith && connected) {
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i], this.document[0]);
				for ( j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

		function addItems() {
			items.push( this );
		}
		for (i = queries.length - 1; i >= 0; i--){
			queries[i][0].each( addItems );
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] === item.item[0]) {
					return false;
				}
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];

		var i, j, cur, inst, targetData, _queries, item, queriesLength,
			items = this.items,
			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
			connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i], this.document[0]);
				for (j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (i = queries.length - 1; i >= 0; i--) {
			targetData = queries[i][1];
			_queries = queries[i][0];

			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				item = $(_queries[j]);

				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		// Determine whether items are being displayed horizontally
		this.floating = this.items.length ?
			this.options.axis === "x" || this._isFloating( this.items[ 0 ].item ) :
			false;

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		var i, item, t, p;

		for (i = this.items.length - 1; i >= 0; i--){
			item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
				continue;
			}

			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (i = this.containers.length - 1; i >= 0; i--){
				p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var className,
			o = that.options;

		if(!o.placeholder || o.placeholder.constructor === String) {
			className = o.placeholder;
			o.placeholder = {
				element: function() {

					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
						element = $( "<" + nodeName + ">", that.document[0] )
							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
							.removeClass("ui-sortable-helper");

					if ( nodeName === "tbody" ) {
						that._createTrPlaceholder(
							that.currentItem.find( "tr" ).eq( 0 ),
							$( "<tr>", that.document[ 0 ] ).appendTo( element )
						);
					} else if ( nodeName === "tr" ) {
						that._createTrPlaceholder( that.currentItem, element );
					} else if ( nodeName === "img" ) {
						element.attr( "src", that.currentItem.attr( "src" ) );
					}

					if ( !className ) {
						element.css( "visibility", "hidden" );
					}

					return element;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) {
						return;
					}

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_createTrPlaceholder: function( sourceTr, targetTr ) {
		var that = this;

		sourceTr.children().each(function() {
			$( "<td>&#160;</td>", that.document[ 0 ] )
				.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
				.appendTo( targetTr );
		});
	},

	_contactContainers: function(event) {
		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis,
			innermostContainer = null,
			innermostIndex = null;

		// get innermost container that intersects with item
		for (i = this.containers.length - 1; i >= 0; i--) {

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
				continue;
			}

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
					continue;
				}

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) {
			return;
		}

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			if (!this.containers[innermostIndex].containerCache.over) {
				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
				this.containers[innermostIndex].containerCache.over = 1;
			}
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			dist = 10000;
			itemWithLeastDistance = null;
			floating = innermostContainer.floating || this._isFloating(this.currentItem);
			posProperty = floating ? "left" : "top";
			sizeProperty = floating ? "width" : "height";
			axis = floating ? "clientX" : "clientY";

			for (j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
					continue;
				}
				if(this.items[j].item[0] === this.currentItem[0]) {
					continue;
				}

				cur = this.items[j].item.offset()[posProperty];
				nearBottom = false;
				if ( event[ axis ] - cur > this.items[ j ][ sizeProperty ] / 2 ) {
					nearBottom = true;
				}

				if ( Math.abs( event[ axis ] - cur ) < dist ) {
					dist = Math.abs( event[ axis ] - cur );
					itemWithLeastDistance = this.items[ j ];
					this.direction = nearBottom ? "up": "down";
				}
			}

			//Check if dropOnEmpty is enabled
			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
				return;
			}

			if(this.currentContainer === this.containers[innermostIndex]) {
				if ( !this.currentContainer.containerCache.over ) {
					this.containers[ innermostIndex ]._trigger( "over", event, this._uiHash() );
					this.currentContainer.containerCache.over = 1;
				}
				return;
			}

			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
			this.currentContainer = this.containers[innermostIndex];

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

		//Add the helper to the DOM if that didn't happen already
		if(!helper.parents("body").length) {
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
		}

		if(helper[0] === this.currentItem[0]) {
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
		}

		if(!helper[0].style.width || o.forceHelperSize) {
			helper.width(this.currentItem.width());
		}
		if(!helper[0].style.height || o.forceHelperSize) {
			helper.height(this.currentItem.height());
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		// This needs to be actually done for all browsers, since pageX/pageY includes this information
		// with an ugly IE fix
		if( this.offsetParent[0] === this.document[0].body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var ce, co, over,
			o = this.options;
		if(o.containment === "parent") {
			o.containment = this.helper[0].parentNode;
		}
		if(o.containment === "document" || o.containment === "window") {
			this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				o.containment === "document" ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left,
				(o.containment === "document" ? this.document.width() : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
			];
		}

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			ce = $(o.containment)[0];
			co = $(o.containment).offset();
			over = ($(ce).css("overflow") !== "hidden");

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}
		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var top, left,
			o = this.options,
			pageX = event.pageX,
			pageY = event.pageY,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) {
					pageX = this.containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < this.containment[1]) {
					pageY = this.containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > this.containment[2]) {
					pageX = this.containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > this.containment[3]) {
					pageY = this.containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																// The absolute mouse position
				this.offset.click.top -													// Click offset (relative to the element)
				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX -																// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter === this.counter) {
				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
			}
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var i,
			delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) {
			this.placeholder.before(this.currentItem);
		}
		this._noFinalSort = null;

		if(this.helper[0] === this.currentItem[0]) {
			for(i in this._storedCSS) {
				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
					this._storedCSS[i] = "";
				}
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		}
		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		}

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		function delayEvent( type, instance, container ) {
			return function( event ) {
				container._trigger( type, event, instance._uiHash( instance ) );
			};
		}
		for (i = this.containers.length - 1; i >= 0; i--){
			if (!noPropagation) {
				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
			}
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if ( this.storedCursor ) {
			this.document.find( "body" ).css( "cursor", this.storedCursor );
			this.storedStylesheet.remove();
		}
		if(this._storedOpacity) {
			this.helper.css("opacity", this._storedOpacity);
		}
		if(this._storedZIndex) {
			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
		}

		this.dragging = false;

		if(!noPropagation) {
			this._trigger("beforeStop", event, this._uiHash());
		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if ( !this.cancelHelperRemoval ) {
			if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
				this.helper.remove();
			}
			this.helper = null;
		}

		if(!noPropagation) {
			for (i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return !this.cancelHelperRemoval;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});


/*!
 * jQuery UI Spinner 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 */


function spinner_modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

var spinner = $.widget( "ui.spinner", {
	version: "1.11.4",
	defaultElement: "<input>",
	widgetEventPrefix: "spin",
	options: {
		culture: null,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		change: null,
		spin: null,
		start: null,
		stop: null
	},

	_create: function() {
		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );

		// Only format if there is a value, prevents the field from being marked
		// as invalid in Firefox, see #9573.
		if ( this.value() !== "" ) {
			// Format the value, but don't constrain.
			this._value( this.element.val(), true );
		}

		this._draw();
		this._on( this._events );
		this._refresh();

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._stop();
			this._refresh();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( (delta > 0 ? 1 : -1) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {
			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "ui-spinner-input" )
			.attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._buttonHtml() );

		this.element.attr( "role", "spinbutton" );

		// button bindings
		this.buttons = uiSpinner.find( ".ui-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "ui-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
				uiSpinner.height() > 0 ) {
			uiSpinner.height( uiSpinner.height() );
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";
	},

	_buttonHtml: function() {
		return "" +
			"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"<span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" +
			"</a>" +
			"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;
		// - round to the nearest step
		aboveMin = Math.round(aboveMin / options.step) * options.step;
		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// clamp the value
		if ( options.max !== null && value > options.max) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		if ( key === "culture" || key === "numberFormat" ) {
			var prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}
		if ( key === "icons" ) {
			this.buttons.first().find( ".ui-icon" )
				.removeClass( this.options.icons.up )
				.addClass( value.up );
			this.buttons.last().find( ".ui-icon" )
				.removeClass( this.options.icons.down )
				.addClass( value.down );
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this.widget().toggleClass( "ui-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			this.buttons.button( value ? "disable" : "enable" );
		}
	},

	_setOptions: spinner_modifier(function( options ) {
		this._super( options );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr({
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,
			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		});
	},

	isValid: function() {
		var value = this.value();

		// null is invalid
		if ( value === null ) {
			return false;
		}

		// if value gets adjusted, it's invalid
		return value === this._adjustValue( value );
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-spinner-input" )
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );
		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: spinner_modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * this.options.step );
			this._stop();
		}
	},

	stepDown: spinner_modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * -this.options.step );
			this._stop();
		}
	},

	pageUp: spinner_modifier(function( pages ) {
		this._stepUp( (pages || 1) * this.options.page );
	}),

	pageDown: spinner_modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),

	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		spinner_modifier( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
});


/*!
 * jQuery UI Tabs 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tabs/
 */


var tabs = $.widget( "ui.tabs", {
	version: "1.11.4",
	delay: 300,
	options: {
		active: null,
		collapsible: false,
		event: "click",
		heightStyle: "content",
		hide: null,
		show: null,

		// callbacks
		activate: null,
		beforeActivate: null,
		beforeLoad: null,
		load: null
	},

	_isLocal: (function() {
		var rhash = /#.*$/;

		return function( anchor ) {
			var anchorUrl, locationUrl;

			// support: IE7
			// IE7 doesn't normalize the href property when set via script (#9317)
			anchor = anchor.cloneNode( false );

			anchorUrl = anchor.href.replace( rhash, "" );
			locationUrl = location.href.replace( rhash, "" );

			// decoding may throw an error if the URL isn't UTF-8 (#9518)
			try {
				anchorUrl = decodeURIComponent( anchorUrl );
			} catch ( error ) {}
			try {
				locationUrl = decodeURIComponent( locationUrl );
			} catch ( error ) {}

			return anchor.hash.length > 1 && anchorUrl === locationUrl;
		};
	})(),

	_create: function() {
		var that = this,
			options = this.options;

		this.running = false;

		this.element
			.addClass( "ui-tabs ui-widget ui-widget-content ui-corner-all" )
			.toggleClass( "ui-tabs-collapsible", options.collapsible );

		this._processTabs();
		options.active = this._initialActive();

		// Take disabling tabs via class attribute from HTML
		// into account and update option properly.
		if ( $.isArray( options.disabled ) ) {
			options.disabled = $.unique( options.disabled.concat(
				$.map( this.tabs.filter( ".ui-state-disabled" ), function( li ) {
					return that.tabs.index( li );
				})
			) ).sort();
		}

		// check for length avoids error when initializing empty list
		if ( this.options.active !== false && this.anchors.length ) {
			this.active = this._findActive( options.active );
		} else {
			this.active = $();
		}

		this._refresh();

		if ( this.active.length ) {
			this.load( options.active );
		}
	},

	_initialActive: function() {
		var active = this.options.active,
			collapsible = this.options.collapsible,
			locationHash = location.hash.substring( 1 );

		if ( active === null ) {
			// check the fragment identifier in the URL
			if ( locationHash ) {
				this.tabs.each(function( i, tab ) {
					if ( $( tab ).attr( "aria-controls" ) === locationHash ) {
						active = i;
						return false;
					}
				});
			}

			// check for a tab marked active via a class
			if ( active === null ) {
				active = this.tabs.index( this.tabs.filter( ".ui-tabs-active" ) );
			}

			// no active tab, set to false
			if ( active === null || active === -1 ) {
				active = this.tabs.length ? 0 : false;
			}
		}

		// handle numbers: negative, out of range
		if ( active !== false ) {
			active = this.tabs.index( this.tabs.eq( active ) );
			if ( active === -1 ) {
				active = collapsible ? false : 0;
			}
		}

		// don't allow collapsible: false and active: false
		if ( !collapsible && active === false && this.anchors.length ) {
			active = 0;
		}

		return active;
	},

	_getCreateEventData: function() {
		return {
			tab: this.active,
			panel: !this.active.length ? $() : this._getPanelForTab( this.active )
		};
	},

	_tabKeydown: function( event ) {
		var focusedTab = $( this.document[0].activeElement ).closest( "li" ),
			selectedIndex = this.tabs.index( focusedTab ),
			goingForward = true;

		if ( this._handlePageNav( event ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case $.ui.keyCode.RIGHT:
			case $.ui.keyCode.DOWN:
				selectedIndex++;
				break;
			case $.ui.keyCode.UP:
			case $.ui.keyCode.LEFT:
				goingForward = false;
				selectedIndex--;
				break;
			case $.ui.keyCode.END:
				selectedIndex = this.anchors.length - 1;
				break;
			case $.ui.keyCode.HOME:
				selectedIndex = 0;
				break;
			case $.ui.keyCode.SPACE:
				// Activate only, no collapsing
				event.preventDefault();
				clearTimeout( this.activating );
				this._activate( selectedIndex );
				return;
			case $.ui.keyCode.ENTER:
				// Toggle (cancel delayed activation, allow collapsing)
				event.preventDefault();
				clearTimeout( this.activating );
				// Determine if we should collapse or activate
				this._activate( selectedIndex === this.options.active ? false : selectedIndex );
				return;
			default:
				return;
		}

		// Focus the appropriate tab, based on which key was pressed
		event.preventDefault();
		clearTimeout( this.activating );
		selectedIndex = this._focusNextTab( selectedIndex, goingForward );

		// Navigating with control/command key will prevent automatic activation
		if ( !event.ctrlKey && !event.metaKey ) {

			// Update aria-selected immediately so that AT think the tab is already selected.
			// Otherwise AT may confuse the user by stating that they need to activate the tab,
			// but the tab will already be activated by the time the announcement finishes.
			focusedTab.attr( "aria-selected", "false" );
			this.tabs.eq( selectedIndex ).attr( "aria-selected", "true" );

			this.activating = this._delay(function() {
				this.option( "active", selectedIndex );
			}, this.delay );
		}
	},

	_panelKeydown: function( event ) {
		if ( this._handlePageNav( event ) ) {
			return;
		}

		// Ctrl+up moves focus to the current tab
		if ( event.ctrlKey && event.keyCode === $.ui.keyCode.UP ) {
			event.preventDefault();
			this.active.focus();
		}
	},

	// Alt+page up/down moves focus to the previous/next tab (and activates)
	_handlePageNav: function( event ) {
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_UP ) {
			this._activate( this._focusNextTab( this.options.active - 1, false ) );
			return true;
		}
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_DOWN ) {
			this._activate( this._focusNextTab( this.options.active + 1, true ) );
			return true;
		}
	},

	_findNextTab: function( index, goingForward ) {
		var lastTabIndex = this.tabs.length - 1;

		function constrain() {
			if ( index > lastTabIndex ) {
				index = 0;
			}
			if ( index < 0 ) {
				index = lastTabIndex;
			}
			return index;
		}

		while ( $.inArray( constrain(), this.options.disabled ) !== -1 ) {
			index = goingForward ? index + 1 : index - 1;
		}

		return index;
	},

	_focusNextTab: function( index, goingForward ) {
		index = this._findNextTab( index, goingForward );
		this.tabs.eq( index ).focus();
		return index;
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		if ( key === "disabled" ) {
			// don't use the widget factory's disabled handling
			this._setupDisabled( value );
			return;
		}

		this._super( key, value);

		if ( key === "collapsible" ) {
			this.element.toggleClass( "ui-tabs-collapsible", value );
			// Setting collapsible: false while collapsed; open first panel
			if ( !value && this.options.active === false ) {
				this._activate( 0 );
			}
		}

		if ( key === "event" ) {
			this._setupEvents( value );
		}

		if ( key === "heightStyle" ) {
			this._setupHeightStyle( value );
		}
	},

	_sanitizeSelector: function( hash ) {
		return hash ? hash.replace( /[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&" ) : "";
	},

	refresh: function() {
		var options = this.options,
			lis = this.tablist.children( ":has(a[href])" );

		// get disabled tabs from class attribute from HTML
		// this will get converted to a boolean if needed in _refresh()
		options.disabled = $.map( lis.filter( ".ui-state-disabled" ), function( tab ) {
			return lis.index( tab );
		});

		this._processTabs();

		// was collapsed or no tabs
		if ( options.active === false || !this.anchors.length ) {
			options.active = false;
			this.active = $();
		// was active, but active tab is gone
		} else if ( this.active.length && !$.contains( this.tablist[ 0 ], this.active[ 0 ] ) ) {
			// all remaining tabs are disabled
			if ( this.tabs.length === options.disabled.length ) {
				options.active = false;
				this.active = $();
			// activate previous tab
			} else {
				this._activate( this._findNextTab( Math.max( 0, options.active - 1 ), false ) );
			}
		// was active, active tab still exists
		} else {
			// make sure active index is correct
			options.active = this.tabs.index( this.active );
		}

		this._refresh();
	},

	_refresh: function() {
		this._setupDisabled( this.options.disabled );
		this._setupEvents( this.options.event );
		this._setupHeightStyle( this.options.heightStyle );

		this.tabs.not( this.active ).attr({
			"aria-selected": "false",
			"aria-expanded": "false",
			tabIndex: -1
		});
		this.panels.not( this._getPanelForTab( this.active ) )
			.hide()
			.attr({
				"aria-hidden": "true"
			});

		// Make sure one tab is in the tab order
		if ( !this.active.length ) {
			this.tabs.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active
				.addClass( "ui-tabs-active ui-state-active" )
				.attr({
					"aria-selected": "true",
					"aria-expanded": "true",
					tabIndex: 0
				});
			this._getPanelForTab( this.active )
				.show()
				.attr({
					"aria-hidden": "false"
				});
		}
	},

	_processTabs: function() {
		var that = this,
			prevTabs = this.tabs,
			prevAnchors = this.anchors,
			prevPanels = this.panels;

		this.tablist = this._getList()
			.addClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.attr( "role", "tablist" )

			// Prevent users from focusing disabled tabs via click
			.delegate( "> li", "mousedown" + this.eventNamespace, function( event ) {
				if ( $( this ).is( ".ui-state-disabled" ) ) {
					event.preventDefault();
				}
			})

			// support: IE <9
			// Preventing the default action in mousedown doesn't prevent IE
			// from focusing the element, so if the anchor gets focused, blur.
			// We don't have to worry about focusing the previously focused
			// element since clicking on a non-focusable element should focus
			// the body anyway.
			.delegate( ".ui-tabs-anchor", "focus" + this.eventNamespace, function() {
				if ( $( this ).closest( "li" ).is( ".ui-state-disabled" ) ) {
					this.blur();
				}
			});

		this.tabs = this.tablist.find( "> li:has(a[href])" )
			.addClass( "ui-state-default ui-corner-top" )
			.attr({
				role: "tab",
				tabIndex: -1
			});

		this.anchors = this.tabs.map(function() {
				return $( "a", this )[ 0 ];
			})
			.addClass( "ui-tabs-anchor" )
			.attr({
				role: "presentation",
				tabIndex: -1
			});

		this.panels = $();

		this.anchors.each(function( i, anchor ) {
			var selector, panel, panelId,
				anchorId = $( anchor ).uniqueId().attr( "id" ),
				tab = $( anchor ).closest( "li" ),
				originalAriaControls = tab.attr( "aria-controls" );

			// inline tab
			if ( that._isLocal( anchor ) ) {
				selector = anchor.hash;
				panelId = selector.substring( 1 );
				panel = that.element.find( that._sanitizeSelector( selector ) );
			// remote tab
			} else {
				// If the tab doesn't already have aria-controls,
				// generate an id by using a throw-away element
				panelId = tab.attr( "aria-controls" ) || $( {} ).uniqueId()[ 0 ].id;
				selector = "#" + panelId;
				panel = that.element.find( selector );
				if ( !panel.length ) {
					panel = that._createPanel( panelId );
					panel.insertAfter( that.panels[ i - 1 ] || that.tablist );
				}
				panel.attr( "aria-live", "polite" );
			}

			if ( panel.length) {
				that.panels = that.panels.add( panel );
			}
			if ( originalAriaControls ) {
				tab.data( "ui-tabs-aria-controls", originalAriaControls );
			}
			tab.attr({
				"aria-controls": panelId,
				"aria-labelledby": anchorId
			});
			panel.attr( "aria-labelledby", anchorId );
		});

		this.panels
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.attr( "role", "tabpanel" );

		// Avoid memory leaks (#10056)
		if ( prevTabs ) {
			this._off( prevTabs.not( this.tabs ) );
			this._off( prevAnchors.not( this.anchors ) );
			this._off( prevPanels.not( this.panels ) );
		}
	},

	// allow overriding how to find the list for rare usage scenarios (#7715)
	_getList: function() {
		return this.tablist || this.element.find( "ol,ul" ).eq( 0 );
	},

	_createPanel: function( id ) {
		return $( "<div>" )
			.attr( "id", id )
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.data( "ui-tabs-destroy", true );
	},

	_setupDisabled: function( disabled ) {
		if ( $.isArray( disabled ) ) {
			if ( !disabled.length ) {
				disabled = false;
			} else if ( disabled.length === this.anchors.length ) {
				disabled = true;
			}
		}

		// disable tabs
		for ( var i = 0, li; ( li = this.tabs[ i ] ); i++ ) {
			if ( disabled === true || $.inArray( i, disabled ) !== -1 ) {
				$( li )
					.addClass( "ui-state-disabled" )
					.attr( "aria-disabled", "true" );
			} else {
				$( li )
					.removeClass( "ui-state-disabled" )
					.removeAttr( "aria-disabled" );
			}
		}

		this.options.disabled = disabled;
	},

	_setupEvents: function( event ) {
		var events = {};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.anchors.add( this.tabs ).add( this.panels ) );
		// Always prevent the default action, even when disabled
		this._on( true, this.anchors, {
			click: function( event ) {
				event.preventDefault();
			}
		});
		this._on( this.anchors, events );
		this._on( this.tabs, { keydown: "_tabKeydown" } );
		this._on( this.panels, { keydown: "_panelKeydown" } );

		this._focusable( this.tabs );
		this._hoverable( this.tabs );
	},

	_setupHeightStyle: function( heightStyle ) {
		var maxHeight,
			parent = this.element.parent();

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			maxHeight -= this.element.outerHeight() - this.element.height();

			this.element.siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});

			this.element.children().not( this.panels ).each(function() {
				maxHeight -= $( this ).outerHeight( true );
			});

			this.panels.each(function() {
				$( this ).height( Math.max( 0, maxHeight -
					$( this ).innerHeight() + $( this ).height() ) );
			})
			.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.panels.each(function() {
				maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
			}).height( maxHeight );
		}
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			anchor = $( event.currentTarget ),
			tab = anchor.closest( "li" ),
			clickedIsActive = tab[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : this._getPanelForTab( tab ),
			toHide = !active.length ? $() : this._getPanelForTab( active ),
			eventData = {
				oldTab: active,
				oldPanel: toHide,
				newTab: collapsing ? $() : tab,
				newPanel: toShow
			};

		event.preventDefault();

		if ( tab.hasClass( "ui-state-disabled" ) ||
				// tab is already loading
				tab.hasClass( "ui-tabs-loading" ) ||
				// can't switch durning an animation
				this.running ||
				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||
				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.tabs.index( tab );

		this.active = clickedIsActive ? $() : tab;
		if ( this.xhr ) {
			this.xhr.abort();
		}

		if ( !toHide.length && !toShow.length ) {
			$.error( "jQuery UI Tabs: Mismatching fragment identifier." );
		}

		if ( toShow.length ) {
			this.load( this.tabs.index( tab ), event );
		}
		this._toggle( event, eventData );
	},

	// handles show/hide for selecting tabs
	_toggle: function( event, eventData ) {
		var that = this,
			toShow = eventData.newPanel,
			toHide = eventData.oldPanel;

		this.running = true;

		function complete() {
			that.running = false;
			that._trigger( "activate", event, eventData );
		}

		function show() {
			eventData.newTab.closest( "li" ).addClass( "ui-tabs-active ui-state-active" );

			if ( toShow.length && that.options.show ) {
				that._show( toShow, that.options.show, complete );
			} else {
				toShow.show();
				complete();
			}
		}

		// start out by hiding, then showing, then completing
		if ( toHide.length && this.options.hide ) {
			this._hide( toHide, this.options.hide, function() {
				eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
				show();
			});
		} else {
			eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
			toHide.hide();
			show();
		}

		toHide.attr( "aria-hidden", "true" );
		eventData.oldTab.attr({
			"aria-selected": "false",
			"aria-expanded": "false"
		});
		// If we're switching tabs, remove the old tab from the tab order.
		// If we're opening from collapsed state, remove the previous tab from the tab order.
		// If we're collapsing, then keep the collapsing tab in the tab order.
		if ( toShow.length && toHide.length ) {
			eventData.oldTab.attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.tabs.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow.attr( "aria-hidden", "false" );
		eventData.newTab.attr({
			"aria-selected": "true",
			"aria-expanded": "true",
			tabIndex: 0
		});
	},

	_activate: function( index ) {
		var anchor,
			active = this._findActive( index );

		// trying to activate the already active panel
		if ( active[ 0 ] === this.active[ 0 ] ) {
			return;
		}

		// trying to collapse, simulate a click on the current active header
		if ( !active.length ) {
			active = this.active;
		}

		anchor = active.find( ".ui-tabs-anchor" )[ 0 ];
		this._eventHandler({
			target: anchor,
			currentTarget: anchor,
			preventDefault: $.noop
		});
	},

	_findActive: function( index ) {
		return index === false ? $() : this.tabs.eq( index );
	},

	_getIndex: function( index ) {
		// meta-function to give users option to provide a href string instead of a numerical index.
		if ( typeof index === "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$='" + index + "']" ) );
		}

		return index;
	},

	_destroy: function() {
		if ( this.xhr ) {
			this.xhr.abort();
		}

		this.element.removeClass( "ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible" );

		this.tablist
			.removeClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.removeAttr( "role" );

		this.anchors
			.removeClass( "ui-tabs-anchor" )
			.removeAttr( "role" )
			.removeAttr( "tabIndex" )
			.removeUniqueId();

		this.tablist.unbind( this.eventNamespace );

		this.tabs.add( this.panels ).each(function() {
			if ( $.data( this, "ui-tabs-destroy" ) ) {
				$( this ).remove();
			} else {
				$( this )
					.removeClass( "ui-state-default ui-state-active ui-state-disabled " +
						"ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel" )
					.removeAttr( "tabIndex" )
					.removeAttr( "aria-live" )
					.removeAttr( "aria-busy" )
					.removeAttr( "aria-selected" )
					.removeAttr( "aria-labelledby" )
					.removeAttr( "aria-hidden" )
					.removeAttr( "aria-expanded" )
					.removeAttr( "role" );
			}
		});

		this.tabs.each(function() {
			var li = $( this ),
				prev = li.data( "ui-tabs-aria-controls" );
			if ( prev ) {
				li
					.attr( "aria-controls", prev )
					.removeData( "ui-tabs-aria-controls" );
			} else {
				li.removeAttr( "aria-controls" );
			}
		});

		this.panels.show();

		if ( this.options.heightStyle !== "content" ) {
			this.panels.css( "height", "" );
		}
	},

	enable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === false ) {
			return;
		}

		if ( index === undefined ) {
			disabled = false;
		} else {
			index = this._getIndex( index );
			if ( $.isArray( disabled ) ) {
				disabled = $.map( disabled, function( num ) {
					return num !== index ? num : null;
				});
			} else {
				disabled = $.map( this.tabs, function( li, num ) {
					return num !== index ? num : null;
				});
			}
		}
		this._setupDisabled( disabled );
	},

	disable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === true ) {
			return;
		}

		if ( index === undefined ) {
			disabled = true;
		} else {
			index = this._getIndex( index );
			if ( $.inArray( index, disabled ) !== -1 ) {
				return;
			}
			if ( $.isArray( disabled ) ) {
				disabled = $.merge( [ index ], disabled ).sort();
			} else {
				disabled = [ index ];
			}
		}
		this._setupDisabled( disabled );
	},

	load: function( index, event ) {
		index = this._getIndex( index );
		var that = this,
			tab = this.tabs.eq( index ),
			anchor = tab.find( ".ui-tabs-anchor" ),
			panel = this._getPanelForTab( tab ),
			eventData = {
				tab: tab,
				panel: panel
			},
			complete = function( jqXHR, status ) {
				if ( status === "abort" ) {
					that.panels.stop( false, true );
				}

				tab.removeClass( "ui-tabs-loading" );
				panel.removeAttr( "aria-busy" );

				if ( jqXHR === that.xhr ) {
					delete that.xhr;
				}
			};

		// not remote
		if ( this._isLocal( anchor[ 0 ] ) ) {
			return;
		}

		this.xhr = $.ajax( this._ajaxSettings( anchor, event, eventData ) );

		// support: jQuery <1.8
		// jQuery <1.8 returns false if the request is canceled in beforeSend,
		// but as of 1.8, $.ajax() always returns a jqXHR object.
		if ( this.xhr && this.xhr.statusText !== "canceled" ) {
			tab.addClass( "ui-tabs-loading" );
			panel.attr( "aria-busy", "true" );

			this.xhr
				.done(function( response, status, jqXHR ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						panel.html( response );
						that._trigger( "load", event, eventData );

						complete( jqXHR, status );
					}, 1 );
				})
				.fail(function( jqXHR, status ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						complete( jqXHR, status );
					}, 1 );
				});
		}
	},

	_ajaxSettings: function( anchor, event, eventData ) {
		var that = this;
		return {
			url: anchor.attr( "href" ),
			beforeSend: function( jqXHR, settings ) {
				return that._trigger( "beforeLoad", event,
					$.extend( { jqXHR: jqXHR, ajaxSettings: settings }, eventData ) );
			}
		};
	},

	_getPanelForTab: function( tab ) {
		var id = $( tab ).attr( "aria-controls" );
		return this.element.find( this._sanitizeSelector( "#" + id ) );
	}
});


/*!
 * jQuery UI Tooltip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tooltip/
 */


var tooltip = $.widget( "ui.tooltip", {
	version: "1.11.4",
	options: {
		content: function() {
			// support: IE<9, Opera in jQuery <1.7
			// .text() can't accept undefined, so coerce to a string
			var title = $( this ).attr( "title" ) || "";
			// Escape title, since we're going from an attribute to raw HTML
			return $( "<a>" ).text( title ).html();
		},
		hide: true,
		// Disabled elements have inconsistent behavior across browsers (#8661)
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		tooltipClass: null,
		track: false,

		// callbacks
		close: null,
		open: null
	},

	_addDescribedBy: function( elem, id ) {
		var describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ );
		describedby.push( id );
		elem
			.data( "ui-tooltip-id", id )
			.attr( "aria-describedby", $.trim( describedby.join( " " ) ) );
	},

	_removeDescribedBy: function( elem ) {
		var id = elem.data( "ui-tooltip-id" ),
			describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ ),
			index = $.inArray( id, describedby );

		if ( index !== -1 ) {
			describedby.splice( index, 1 );
		}

		elem.removeData( "ui-tooltip-id" );
		describedby = $.trim( describedby.join( " " ) );
		if ( describedby ) {
			elem.attr( "aria-describedby", describedby );
		} else {
			elem.removeAttr( "aria-describedby" );
		}
	},

	_create: function() {
		this._on({
			mouseover: "open",
			focusin: "open"
		});

		// IDs of generated tooltips, needed for destroy
		this.tooltips = {};

		// IDs of parent tooltips where we removed the title attribute
		this.parents = {};

		if ( this.options.disabled ) {
			this._disable();
		}

		// Append the aria-live region so tooltips announce correctly
		this.liveRegion = $( "<div>" )
			.attr({
				role: "log",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			})
			.addClass( "ui-helper-hidden-accessible" )
			.appendTo( this.document[ 0 ].body );
	},

	_setOption: function( key, value ) {
		var that = this;

		if ( key === "disabled" ) {
			this[ value ? "_disable" : "_enable" ]();
			this.options[ key ] = value;
			// disable element style changes
			return;
		}

		this._super( key, value );

		if ( key === "content" ) {
			$.each( this.tooltips, function( id, tooltipData ) {
				that._updateContent( tooltipData.element );
			});
		}
	},

	_disable: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {
			var event = $.Event( "blur" );
			event.target = event.currentTarget = tooltipData.element[ 0 ];
			that.close( event, true );
		});

		// remove title attributes to prevent native tooltips
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.is( "[title]" ) ) {
				element
					.data( "ui-tooltip-title", element.attr( "title" ) )
					.removeAttr( "title" );
			}
		});
	},

	_enable: function() {
		// restore title attributes
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
			}
		});
	},

	open: function( event ) {
		var that = this,
			target = $( event ? event.target : this.element )
				// we need closest here due to mouseover bubbling,
				// but always pointing at the same event target
				.closest( this.options.items );

		// No element to show a tooltip for or the tooltip is already open
		if ( !target.length || target.data( "ui-tooltip-id" ) ) {
			return;
		}

		if ( target.attr( "title" ) ) {
			target.data( "ui-tooltip-title", target.attr( "title" ) );
		}

		target.data( "ui-tooltip-open", true );

		// kill parent tooltips, custom or native, for hover
		if ( event && event.type === "mouseover" ) {
			target.parents().each(function() {
				var parent = $( this ),
					blurEvent;
				if ( parent.data( "ui-tooltip-open" ) ) {
					blurEvent = $.Event( "blur" );
					blurEvent.target = blurEvent.currentTarget = this;
					that.close( blurEvent, true );
				}
				if ( parent.attr( "title" ) ) {
					parent.uniqueId();
					that.parents[ this.id ] = {
						element: this,
						title: parent.attr( "title" )
					};
					parent.attr( "title", "" );
				}
			});
		}

		this._registerCloseHandlers( event, target );
		this._updateContent( target, event );
	},

	_updateContent: function( target, event ) {
		var content,
			contentOption = this.options.content,
			that = this,
			eventType = event ? event.type : null;

		if ( typeof contentOption === "string" ) {
			return this._open( event, target, contentOption );
		}

		content = contentOption.call( target[0], function( response ) {

			// IE may instantly serve a cached response for ajax requests
			// delay this call to _open so the other call to _open runs first
			that._delay(function() {

				// Ignore async response if tooltip was closed already
				if ( !target.data( "ui-tooltip-open" ) ) {
					return;
				}

				// jQuery creates a special event for focusin when it doesn't
				// exist natively. To improve performance, the native event
				// object is reused and the type is changed. Therefore, we can't
				// rely on the type being correct after the event finished
				// bubbling, so we set it back to the previous value. (#8740)
				if ( event ) {
					event.type = eventType;
				}
				this._open( event, target, response );
			});
		});
		if ( content ) {
			this._open( event, target, content );
		}
	},

	_open: function( event, target, content ) {
		var tooltipData, tooltip, delayedShow, a11yContent,
			positionOption = $.extend( {}, this.options.position );

		if ( !content ) {
			return;
		}

		// Content can be updated multiple times. If the tooltip already
		// exists, then just update the content and bail.
		tooltipData = this._find( target );
		if ( tooltipData ) {
			tooltipData.tooltip.find( ".ui-tooltip-content" ).html( content );
			return;
		}

		// if we have a title, clear it to prevent the native tooltip
		// we have to check first to avoid defining a title if none exists
		// (we don't want to cause an element to start matching [title])
		//
		// We use removeAttr only for key events, to allow IE to export the correct
		// accessible attributes. For mouse events, set to empty string to avoid
		// native tooltip showing up (happens only when removing inside mouseover).
		if ( target.is( "[title]" ) ) {
			if ( event && event.type === "mouseover" ) {
				target.attr( "title", "" );
			} else {
				target.removeAttr( "title" );
			}
		}

		tooltipData = this._tooltip( target );
		tooltip = tooltipData.tooltip;
		this._addDescribedBy( target, tooltip.attr( "id" ) );
		tooltip.find( ".ui-tooltip-content" ).html( content );

		// Support: Voiceover on OS X, JAWS on IE <= 9
		// JAWS announces deletions even when aria-relevant="additions"
		// Voiceover will sometimes re-read the entire log region's contents from the beginning
		this.liveRegion.children().hide();
		if ( content.clone ) {
			a11yContent = content.clone();
			a11yContent.removeAttr( "id" ).find( "[id]" ).removeAttr( "id" );
		} else {
			a11yContent = content;
		}
		$( "<div>" ).html( a11yContent ).appendTo( this.liveRegion );

		function position( event ) {
			positionOption.of = event;
			if ( tooltip.is( ":hidden" ) ) {
				return;
			}
			tooltip.position( positionOption );
		}
		if ( this.options.track && event && /^mouse/.test( event.type ) ) {
			this._on( this.document, {
				mousemove: position
			});
			// trigger once to override element-relative positioning
			position( event );
		} else {
			tooltip.position( $.extend({
				of: target
			}, this.options.position ) );
		}

		tooltip.hide();

		this._show( tooltip, this.options.show );
		// Handle tracking tooltips that are shown with a delay (#8644). As soon
		// as the tooltip is visible, position the tooltip using the most recent
		// event.
		if ( this.options.show && this.options.show.delay ) {
			delayedShow = this.delayedShow = setInterval(function() {
				if ( tooltip.is( ":visible" ) ) {
					position( positionOption.of );
					clearInterval( delayedShow );
				}
			}, $.fx.interval );
		}

		this._trigger( "open", event, { tooltip: tooltip } );
	},

	_registerCloseHandlers: function( event, target ) {
		var events = {
			keyup: function( event ) {
				if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
					var fakeEvent = $.Event(event);
					fakeEvent.currentTarget = target[0];
					this.close( fakeEvent, true );
				}
			}
		};

		// Only bind remove handler for delegated targets. Non-delegated
		// tooltips will handle this in destroy.
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			events.remove = function() {
				this._removeTooltip( this._find( target ).tooltip );
			};
		}

		if ( !event || event.type === "mouseover" ) {
			events.mouseleave = "close";
		}
		if ( !event || event.type === "focusin" ) {
			events.focusout = "close";
		}
		this._on( true, target, events );
	},

	close: function( event ) {
		var tooltip,
			that = this,
			target = $( event ? event.currentTarget : this.element ),
			tooltipData = this._find( target );

		// The tooltip may already be closed
		if ( !tooltipData ) {

			// We set ui-tooltip-open immediately upon open (in open()), but only set the
			// additional data once there's actually content to show (in _open()). So even if the
			// tooltip doesn't have full data, we always remove ui-tooltip-open in case we're in
			// the period between open() and _open().
			target.removeData( "ui-tooltip-open" );
			return;
		}

		tooltip = tooltipData.tooltip;

		// disabling closes the tooltip, so we need to track when we're closing
		// to avoid an infinite loop in case the tooltip becomes disabled on close
		if ( tooltipData.closing ) {
			return;
		}

		// Clear the interval for delayed tracking tooltips
		clearInterval( this.delayedShow );

		// only set title if we had one before (see comment in _open())
		// If the title attribute has changed since open(), don't restore
		if ( target.data( "ui-tooltip-title" ) && !target.attr( "title" ) ) {
			target.attr( "title", target.data( "ui-tooltip-title" ) );
		}

		this._removeDescribedBy( target );

		tooltipData.hiding = true;
		tooltip.stop( true );
		this._hide( tooltip, this.options.hide, function() {
			that._removeTooltip( $( this ) );
		});

		target.removeData( "ui-tooltip-open" );
		this._off( target, "mouseleave focusout keyup" );

		// Remove 'remove' binding only on delegated targets
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			this._off( target, "remove" );
		}
		this._off( this.document, "mousemove" );

		if ( event && event.type === "mouseleave" ) {
			$.each( this.parents, function( id, parent ) {
				$( parent.element ).attr( "title", parent.title );
				delete that.parents[ id ];
			});
		}

		tooltipData.closing = true;
		this._trigger( "close", event, { tooltip: tooltip } );
		if ( !tooltipData.hiding ) {
			tooltipData.closing = false;
		}
	},

	_tooltip: function( element ) {
		var tooltip = $( "<div>" )
				.attr( "role", "tooltip" )
				.addClass( "ui-tooltip ui-widget ui-corner-all ui-widget-content " +
					( this.options.tooltipClass || "" ) ),
			id = tooltip.uniqueId().attr( "id" );

		$( "<div>" )
			.addClass( "ui-tooltip-content" )
			.appendTo( tooltip );

		tooltip.appendTo( this.document[0].body );

		return this.tooltips[ id ] = {
			element: element,
			tooltip: tooltip
		};
	},

	_find: function( target ) {
		var id = target.data( "ui-tooltip-id" );
		return id ? this.tooltips[ id ] : null;
	},

	_removeTooltip: function( tooltip ) {
		tooltip.remove();
		delete this.tooltips[ tooltip.attr( "id" ) ];
	},

	_destroy: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {
			// Delegate to close method to handle common cleanup
			var event = $.Event( "blur" ),
				element = tooltipData.element;
			event.target = event.currentTarget = element[ 0 ];
			that.close( event, true );

			// Remove immediately; destroying an open tooltip doesn't use the
			// hide animation
			$( "#" + id ).remove();

			// Restore the title
			if ( element.data( "ui-tooltip-title" ) ) {
				// If the title attribute has changed since open(), don't restore
				if ( !element.attr( "title" ) ) {
					element.attr( "title", element.data( "ui-tooltip-title" ) );
				}
				element.removeData( "ui-tooltip-title" );
			}
		});
		this.liveRegion.remove();
	}
});



}));