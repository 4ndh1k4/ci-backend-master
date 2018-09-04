<?php 

$string = " 
    <!-- Content Header (Page header) -->
    <section class=\"content-header\">
      <h1>        
        <small></small>
      </h1>
      <ol class=\"breadcrumb\">
        <li><?php echo anchor('dashboard','<i class=\"fa fa-dashboard\"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class=\"content\">
	<?php if(isset(\$message)){   
		 echo '<div class=\"alert alert-warning\">  
		   <a href=\"#\" class=\"close\" data-dismiss=\"alert\">&times;</a>  
		   '.\$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class=\"box\">
        <div class=\"box-header\">
		 <h3 class=\"box-title\"><?php echo \$button ;?> ".ucfirst($table_name)."</h3>
		<hr />	 
		<?php echo form_open(\$action);?>";
	foreach ($non_pk as $row) {
		if ($row["data_type"] == 'text')
		{
		$string .= "\n\t    <div class=\"form-group\">
				<?php 
					echo form_label('".label($row["column_name"])."');
					echo form_error('".$row["column_name"]."');
					echo form_textarea($".($row["column_name"]).");
				?>
			</div>";
		} else
		{
		$string .= "\n\t    <div class=\"form-group\">
				<?php 
					echo form_label('".label($row["column_name"])."');
					echo form_error('".$row["column_name"]."');
					echo form_input($".($row["column_name"]).");
				?>				
			</div>";
		}
	}
	$string .= "\n\t    <?php 
			echo form_input($".$pk.");";
	$string .= "\n\t    	echo form_submit('submit', \$button , array('class'=>'btn btn-flat btn-primary'));";
	$string .= "\n\t        echo anchor('".$c_url."','Batal',array('class'=>'btn btn-flat btn-default')); 
						?>";
	$string .= "\n\t<?php echo form_close();?>
		</div>
	 </div>
               
    </section>
	<!-- /.content -->

    ";

$hasil_view_form = createFile($string, $target."views/" . $c_url . "/" . $v_form_file);

?>