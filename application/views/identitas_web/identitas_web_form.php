 
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>        
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title"><?php echo $button ;?> Identitas Web</h3>
		<hr />	 
		<?php echo form_open_multipart($action);?>
	    <div class="form-group">
				<?php 
					echo form_label('Nama Web');
					echo form_error('nama_web');
					echo form_input($nama_web);
				?>				
			</div>
	    <div class="form-group">
				<?php 
					echo form_label('Meta Deskripsi');
					echo form_error('meta_deskripsi');
					echo form_textarea($meta_deskripsi);
				?>
			</div>
	    <div class="form-group">
				<?php 
					echo form_label('Meta Keyword');
					echo form_error('meta_keyword');
					echo form_textarea($meta_keyword);
				?>
			</div>
	    <div class="form-group">
				<?php 
					echo form_label('Copyright');
					echo form_error('copyright');
					echo form_input($copyright);
				?>				
			</div>
	    <div class="form-group">
				<?php 
					echo form_label('Logo');
					echo form_error('logo');
					echo form_upload($logo);
					echo '</br>';
					
					echo img($logo['value']);
				?>				
			</div>
	    <?php 
			echo form_input($id_identitas);
	    	echo form_submit('submit', $button , array('class'=>'btn btn-flat btn-primary'));
	        echo anchor('identitas_web','Batal',array('class'=>'btn btn-flat btn-default')); 
						?>
	<?php echo form_close();?>
		</div>
	 </div>
               
    </section>
	<!-- /.content -->

    